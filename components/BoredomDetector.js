"use client";

import { useEffect, useRef, useState } from "react";
import { boredomLabel, combineBoredomScore, scoreBoredomFrame } from "@/utils/boredom";
import styles from "./BoredomDetector.module.css";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const WINDOW_SIZE = 180;

export default function BoredomDetector() {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const scoresRef = useRef([]);
  const lastUiRef = useRef(0);
  const wrapRef = useRef(null);
  const dragRef = useRef(null);
  const [verdict, setVerdict] = useState(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setError("");
      setVerdict(null);
      setScore(0);
      scoresRef.current = [];

      try {
        const { FaceLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);

        let landmarker;
        try {
          landmarker = await FaceLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: MODEL_PATH, delegate: "GPU" },
            runningMode: "VIDEO",
            numFaces: 1,
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
          });
        } catch {
          landmarker = await FaceLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: MODEL_PATH, delegate: "CPU" },
            runningMode: "VIDEO",
            numFaces: 1,
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
          });
        }

        if (cancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          landmarker.close();
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        const detect = () => {
          if (cancelled || !landmarkerRef.current || !videoRef.current) {
            return;
          }

          const currentVideo = videoRef.current;
          if (currentVideo.readyState >= 2) {
            const result = landmarkerRef.current.detectForVideo(
              currentVideo,
              performance.now(),
            );
            const frame = scoreBoredomFrame(result);
            const windowScores = scoresRef.current;
            windowScores.push(frame);
            if (windowScores.length > WINDOW_SIZE) {
              windowScores.shift();
            }

            const now = performance.now();
            if (now - lastUiRef.current > 250) {
              lastUiRef.current = now;
              const { average, faceRate, wander, yawnDetected, dozingDetected } =
                combineBoredomScore(windowScores);
              const nextVerdict = boredomLabel(
                average,
                faceRate,
                wander,
                yawnDetected,
                dozingDetected,
              );
              setVerdict(nextVerdict);
              setScore(nextVerdict.key === "noface" ? 0 : average);
            }
          }

          rafRef.current = requestAnimationFrame(detect);
        };

        rafRef.current = requestAnimationFrame(detect);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.name === "NotAllowedError"
              ? "カメラの使用が許可されませんでした。"
              : "カメラまたはモデルの起動に失敗しました。",
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const parent = wrap?.offsetParent;
    if (!wrap || !parent) {
      return undefined;
    }

    const margin = 16;
    const x = margin;
    const y = Math.max(0, parent.clientHeight - wrap.offsetHeight - margin);
    setPosition({ x, y });

    function onResize() {
      setPosition((current) => clampPosition(current.x, current.y));
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function clampPosition(x, y) {
    const wrap = wrapRef.current;
    const parent = wrap?.offsetParent;
    if (!wrap || !parent) {
      return { x, y };
    }

    const maxX = Math.max(0, parent.clientWidth - wrap.offsetWidth);
    const maxY = Math.max(0, parent.clientHeight - wrap.offsetHeight);
    return {
      x: Math.min(maxX, Math.max(0, x)),
      y: Math.min(maxY, Math.max(0, y)),
    };
  }

  function handlePointerDown(event) {
    if (event.pointerType === "touch") {
      event.currentTarget.setPointerCapture(event.pointerId);
    } else {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    dragRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: position.x,
      y: position.y,
    };
    setDragging(true);
  }

  function handlePointerMove(event) {
    if (!dragRef.current) {
      return;
    }

    const nextX = dragRef.current.x + event.clientX - dragRef.current.pointerX;
    const nextY = dragRef.current.y + event.clientY - dragRef.current.pointerY;
    setPosition(clampPosition(nextX, nextY));
  }

  function handlePointerUp(event) {
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${dragging ? styles.dragging : ""}`}
      style={{ left: position.x, top: position.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="カメラ映像。ドラッグして移動できます"
    >
      <section className={styles.panel} aria-live="polite">
        <video
          ref={videoRef}
          className={styles.video}
          playsInline
          muted
          autoPlay
        />
        <div className={styles.meter}>
          <div
            className={styles.meterTrack}
            role="meter"
            aria-label="退屈度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(score * 100)}
          >
            <div
              className={`${styles.meterFill} ${verdict ? styles[verdict.key] : styles.noface}`}
              style={{ width: `${Math.round(score * 100)}%` }}
            />
          </div>
        </div>
        <div className={styles.levels}>
          {verdict?.key === "noface" ? (
            <span className={styles.undetected}>顔が見えません</span>
          ) : verdict?.key === "doze" ? (
            <span className={styles.dozeValue}>居眠り</span>
          ) : (
            <>
              <span className={styles.focusValue}>
                集中 {Math.round((1 - score) * 100)}%
              </span>
              <span className={styles.boredValue}>
                退屈 {Math.round(score * 100)}%
              </span>
            </>
          )}
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </section>
    </div>
  );
}
