const LEFT_IRIS = 468;
const RIGHT_IRIS = 473;
const LEFT_INNER = 133;
const LEFT_OUTER = 33;
const LEFT_TOP = 159;
const LEFT_BOTTOM = 145;
const RIGHT_INNER = 362;
const RIGHT_OUTER = 263;
const RIGHT_TOP = 386;
const RIGHT_BOTTOM = 374;

function blend(result, name) {
  const categories = result.faceBlendshapes?.[0]?.categories;
  if (!categories) {
    return 0;
  }

  const found = categories.find((item) => item.categoryName === name);
  return found?.score ?? 0;
}

function headAngles(result) {
  const data = result.facialTransformationMatrixes?.[0]?.data;
  if (!data || data.length < 16) {
    return { yaw: 0, pitch: 0 };
  }

  const yaw = Math.atan2(data[8], data[10]);
  const pitch = Math.atan2(
    -data[2],
    Math.sqrt(data[6] * data[6] + data[10] * data[10]),
  );

  return { yaw, pitch };
}

function axisOffset(value, start, end) {
  const middle = (start + end) / 2;
  const half = (end - start) / 2;
  if (Math.abs(half) < 1e-6) {
    return 0;
  }
  return Math.max(-1, Math.min(1, (value - middle) / half));
}

function irisGaze(landmarks) {
  if (!landmarks || landmarks.length <= RIGHT_IRIS) {
    return null;
  }

  const leftX = axisOffset(
    landmarks[LEFT_IRIS].x,
    landmarks[LEFT_INNER].x,
    landmarks[LEFT_OUTER].x,
  );
  const leftY = axisOffset(
    landmarks[LEFT_IRIS].y,
    landmarks[LEFT_TOP].y,
    landmarks[LEFT_BOTTOM].y,
  );
  const rightX = axisOffset(
    landmarks[RIGHT_IRIS].x,
    landmarks[RIGHT_INNER].x,
    landmarks[RIGHT_OUTER].x,
  );
  const rightY = axisOffset(
    landmarks[RIGHT_IRIS].y,
    landmarks[RIGHT_TOP].y,
    landmarks[RIGHT_BOTTOM].y,
  );

  return {
    x: (leftX + rightX) / 2,
    y: (leftY + rightY) / 2,
  };
}

function estimateGaze(result) {
  const { yaw, pitch } = headAngles(result);
  const lookInL = blend(result, "eyeLookInLeft");
  const lookOutL = blend(result, "eyeLookOutLeft");
  const lookInR = blend(result, "eyeLookInRight");
  const lookOutR = blend(result, "eyeLookOutRight");
  const lookUp =
    (blend(result, "eyeLookUpLeft") + blend(result, "eyeLookUpRight")) / 2;
  const lookDown =
    (blend(result, "eyeLookDownLeft") + blend(result, "eyeLookDownRight")) / 2;

  const blendYaw = (lookOutL - lookInL + (lookInR - lookOutR)) / 2;
  const blendPitch = lookDown - lookUp;
  const iris = irisGaze(result.faceLandmarks[0]);

  const eyeYaw = iris ? blendYaw * 0.4 + iris.x * 0.6 : blendYaw;
  const eyePitch = iris ? blendPitch * 0.4 + iris.y * 0.6 : blendPitch;

  const gazeYaw = yaw + eyeYaw * 0.5;
  const gazePitch = pitch + eyePitch * 0.45;
  const offset = Math.hypot(gazeYaw, gazePitch);
  const offScreen = Math.min(1, Math.max(0, offset - 0.16) / 0.48);

  return {
    yaw,
    pitch,
    gazeYaw,
    gazePitch,
    offset,
    offScreen,
    lookingDown: Math.max(0, gazePitch - 0.14) / 0.4,
  };
}

function stddev(values) {
  if (values.length < 2) {
    return 0;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function gazeWander(frames) {
  const gazes = frames.filter((frame) => frame.face && frame.gaze);
  if (gazes.length < 10) {
    return 0;
  }

  const wander =
    (stddev(gazes.map((frame) => frame.gaze.gazeYaw)) +
      stddev(gazes.map((frame) => frame.gaze.gazePitch))) /
    0.32;

  return Math.min(1, wander);
}

function eyeAspect(landmarks, top, bottom, inner, outer) {
  if (!landmarks[top] || !landmarks[bottom] || !landmarks[inner] || !landmarks[outer]) {
    return 1;
  }

  const vertical = Math.hypot(
    landmarks[top].x - landmarks[bottom].x,
    landmarks[top].y - landmarks[bottom].y,
  );
  const horizontal = Math.hypot(
    landmarks[inner].x - landmarks[outer].x,
    landmarks[inner].y - landmarks[outer].y,
  );

  return horizontal < 1e-6 ? 1 : vertical / horizontal;
}

function eyesAreClosed(result, blink) {
  const landmarks = result.faceLandmarks[0];
  const ear =
    (eyeAspect(landmarks, LEFT_TOP, LEFT_BOTTOM, LEFT_INNER, LEFT_OUTER) +
      eyeAspect(landmarks, RIGHT_TOP, RIGHT_BOTTOM, RIGHT_INNER, RIGHT_OUTER)) /
    2;

  return blink > 0.45 || ear < 0.14;
}

export function scoreBoredomFrame(result) {
  if (!result?.faceLandmarks?.length) {
    return {
      score: 0.55,
      face: false,
      gaze: null,
      yawn: false,
      eyesClosed: false,
      at: performance.now(),
      reasons: ["顔が見つかりません"],
    };
  }

  const gaze = estimateGaze(result);
  const jawOpen = blend(result, "jawOpen");
  const smile =
    (blend(result, "mouthSmileLeft") + blend(result, "mouthSmileRight")) / 2;
  const blink =
    (blend(result, "eyeBlinkLeft") + blend(result, "eyeBlinkRight")) / 2;

  const yawn = jawOpen > 0.48 ? Math.min(1, (jawOpen - 0.48) / 0.4) : 0;
  const drowsy = blink > 0.42 ? (blink - 0.42) / 0.58 : 0;
  const unsmiling = Math.max(0, 0.22 - smile) / 0.22;
  const lookingDown = Math.min(1, gaze.lookingDown);
  const isYawn = yawn > 0.35;
  const eyesClosed = eyesAreClosed(result, blink);

  const score = isYawn
    ? 1
    : Math.min(
        1,
        gaze.offScreen * 0.38 +
          lookingDown * 0.18 +
          drowsy * 0.16 +
          unsmiling * 0.12,
      );

  const reasons = [];
  if (isYawn) {
    reasons.push("あくび");
  }
  if (gaze.offScreen > 0.45) {
    reasons.push("画面から視線が外れている");
  }
  if (lookingDown > 0.5 && gaze.offScreen <= 0.45) {
    reasons.push("うつむいている");
  }
  if (drowsy > 0.4 && !eyesClosed) {
    reasons.push("目が細い");
  }

  return {
    score,
    face: true,
    gaze,
    yawn: isYawn,
    eyesClosed,
    at: performance.now(),
    reasons,
  };
}

function longestEyeCloseMs(frames) {
  let longest = 0;
  let startedAt = null;

  let prevClosed = false;

  for (const frame of frames) {
    const closed = frame.eyesClosed || (!frame.face && prevClosed);
    if (closed) {
      if (startedAt == null) {
        startedAt = frame.at;
      }
      longest = Math.max(longest, frame.at - startedAt);
      prevClosed = true;
    } else {
      startedAt = null;
      prevClosed = false;
    }
  }

  return longest;
}

function smoothPitches(samples) {
  if (samples.length === 0) {
    return [];
  }

  const radius = 2;
  return samples.map((sample, index) => {
    const from = Math.max(0, index - radius);
    const to = Math.min(samples.length, index + radius + 1);
    let total = 0;
    for (let i = from; i < to; i += 1) {
      total += samples[i].pitch;
    }
    return { at: sample.at, pitch: total / (to - from) };
  });
}

function downsampleByTime(samples, minGapMs) {
  const series = [];
  for (const sample of samples) {
    if (series.length === 0 || sample.at - series[series.length - 1].at >= minGapMs) {
      series.push(sample);
    }
  }
  return series;
}

export function countKokuriNods(frames) {
  const now = frames[frames.length - 1]?.at ?? 0;
  const recent = frames.filter(
    (frame) => frame.face && frame.gaze && now - frame.at <= 4500,
  );
  const series = downsampleByTime(
    smoothPitches(
      recent.map((frame) => ({ at: frame.at, pitch: frame.gaze.pitch })),
    ),
    60,
  );

  if (series.length < 8) {
    return 0;
  }

  const dropThreshold = 0.07;
  const recoverThreshold = 0.04;
  const minMs = 220;
  const maxMs = 1600;
  let nods = 0;
  let waitingForDrop = true;
  let baseline = series[0].pitch;
  let extreme = series[0].pitch;
  let turnedAt = series[0].at;

  for (const sample of series) {
    if (waitingForDrop) {
      baseline = Math.min(baseline, sample.pitch);
      if (sample.pitch - baseline >= dropThreshold) {
        waitingForDrop = false;
        extreme = sample.pitch;
        turnedAt = sample.at;
      }
    } else {
      extreme = Math.max(extreme, sample.pitch);
      const elapsed = sample.at - turnedAt;
      if (extreme - sample.pitch >= recoverThreshold && elapsed >= minMs && elapsed <= maxMs) {
        nods += 1;
        waitingForDrop = true;
        baseline = sample.pitch;
        turnedAt = sample.at;
      } else if (elapsed > maxMs) {
        waitingForDrop = true;
        baseline = sample.pitch;
        turnedAt = sample.at;
      }
    }
  }

  return nods;
}

export function detectDozing(frames) {
  if (frames.length < 12) {
    return false;
  }

  const closeMs = longestEyeCloseMs(frames);
  const perclos =
    frames.filter((frame) => frame.eyesClosed).length / frames.length;
  const pitches = frames
    .filter((frame) => frame.face && frame.gaze)
    .map((frame) => frame.gaze.pitch);
  const headDropped =
    pitches.length > 0 &&
    pitches.reduce((sum, value) => sum + value, 0) / pitches.length > 0.2;
  const nods = countKokuriNods(frames);

  return (
    nods >= 2 ||
    closeMs >= 1000 ||
    perclos >= 0.35 ||
    (closeMs >= 700 && headDropped)
  );
}

export function combineBoredomScore(frames) {
  if (frames.length === 0) {
    return {
      average: 0,
      faceRate: 0,
      wander: 0,
      yawnDetected: false,
      dozingDetected: false,
    };
  }

  const faceRate = frames.filter((frame) => frame.face).length / frames.length;
  const average =
    frames.reduce((sum, frame) => sum + frame.score, 0) / frames.length;
  const wander = gazeWander(frames);
  const yawnDetected = frames.some((frame) => frame.yawn);
  const dozingDetected = detectDozing(frames);

  return {
    average:
      yawnDetected || dozingDetected
        ? 1
        : Math.min(1, average * 0.82 + wander * 0.18),
    faceRate,
    wander,
    yawnDetected,
    dozingDetected,
  };
}

export function boredomLabel(
  averageScore,
  faceRate,
  wander = 0,
  yawnDetected = false,
  dozingDetected = false,
) {
  if (faceRate < 0.25 && !yawnDetected && !dozingDetected) {
    return { key: "noface", text: "顔が見えません" };
  }
  if (dozingDetected) {
    return { key: "doze", text: "居眠りしていそう" };
  }
  if (yawnDetected || averageScore >= 0.55 || (averageScore >= 0.45 && wander > 0.55)) {
    return { key: "bored", text: "退屈していそう" };
  }
  if (averageScore >= 0.38 || wander > 0.5) {
    return { key: "maybe", text: "やや退屈そう" };
  }
  return { key: "focus", text: "集中していそう" };
}

export function extraGazeReasons(wander, frames) {
  const reasons = [];
  if (detectDozing(frames)) {
    reasons.push("居眠り");
  }
  if (frames.some((frame) => frame.yawn)) {
    reasons.push("あくび");
  }
  if (wander > 0.45) {
    reasons.push("視線が泳いでいる");
  }

  const latest = [...frames].reverse().find((frame) => frame.reasons.length);
  if (latest) {
    reasons.push(...latest.reasons.filter((reason) => !reasons.includes(reason)));
  }

  return reasons;
}
