"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ChatPrompt from "@/components/ChatPrompt";
import BoredomDetector from "@/components/BoredomDetector";
import styles from "./page.module.css";

const DEFAULT_CHAT_WIDTH = 380;
const MIN_CHAT_WIDTH = 280;
const MIN_MAIN_WIDTH = 280;

const QUESTIONS = [
  {
    id: "q1",
    title: "第1問",
    prompt: "サイバー空間の例として最も適切なものはどれですか。",
    options: [
      { value: "1", label: "① 道路そのもの" },
      { value: "2", label: "② 農地そのもの" },
      { value: "3", label: "③ クラウド上のデータ処理システム" },
      { value: "4", label: "④ 自動車のタイヤ" },
    ],
    answer: "3",
    symbol: "③",
  },
  {
    id: "q2",
    title: "第2問",
    prompt: "フィジカル空間から温度、光、距離などの情報を取得するために使用されるものはどれですか。",
    options: [
      { value: "1", label: "① センサ" },
      { value: "2", label: "② ディスプレイ" },
      { value: "3", label: "③ スピーカー" },
      { value: "4", label: "④ ヒートシンク" },
    ],
    answer: "1",
    symbol: "①",
  },
  {
    id: "q3",
    title: "第3問",
    prompt: "Society 5.0について最も適切な説明はどれですか。",
    options: [
      { value: "1", label: "① インターネットを使用しない社会" },
      { value: "2", label: "② サイバー空間とフィジカル空間を高度に融合した人間中心の社会" },
      { value: "3", label: "③ 工場で大量生産だけを行う社会" },
      { value: "4", label: "④ 半導体を使用しない社会" },
    ],
    answer: "2",
    symbol: "②",
  },
  {
    id: "q4",
    title: "第4問",
    prompt: "AIの大量の計算処理に利用される半導体として適切なものはどれですか。",
    options: [
      { value: "1", label: "① GPU" },
      { value: "2", label: "② LEDだけ" },
      { value: "3", label: "③ 抵抗器だけ" },
      { value: "4", label: "④ ヒューズ" },
    ],
    answer: "1",
    symbol: "①",
  },
  {
    id: "q5",
    title: "第5問",
    prompt: "Society 5.0における情報の流れとして最も適切なものはどれですか。",
    options: [
      { value: "1", label: "① AI → 真空管 → 紙 → 人" },
      { value: "2", label: "② フィジカル空間 → データ収集 → サイバー空間で分析 → フィジカル空間へ反映" },
      { value: "3", label: "③ サイバー空間 → データを削除 → 終了" },
      { value: "4", label: "④ フィジカル空間とサイバー空間は完全に独立している" },
    ],
    answer: "2",
    symbol: "②",
  },
];

export default function StudyPage({ isAdminUser = false, children }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const [resizing, setResizing] = useState(false);
  const resultRef = useRef(null);
  const contentRef = useRef(null);
  const bodyRef = useRef(null);
  const resizingRef = useRef(false);

  function clampChatWidth(width) {
    const bodyWidth = bodyRef.current?.getBoundingClientRect().width ?? 1200;
    const maxWidth = Math.max(240, bodyWidth - MIN_MAIN_WIDTH);
    const minWidth = Math.min(MIN_CHAT_WIDTH, maxWidth);
    return Math.round(Math.min(maxWidth, Math.max(minWidth, width)));
  }

  function handleResizePointerDown(event) {
    if (event.pointerType === "touch") {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizingRef.current = true;
    setResizing(true);
  }

  function handleResizePointerMove(event) {
    if (!resizingRef.current || !bodyRef.current) {
      return;
    }

    const right = bodyRef.current.getBoundingClientRect().right;
    setChatWidth(clampChatWidth(right - event.clientX));
  }

  function handleResizePointerUp(event) {
    resizingRef.current = false;
    setResizing(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleChange(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function gradeQuiz() {
    const details = QUESTIONS.map((question) => {
      const selected = answers[question.id];
      if (!selected) {
        return { id: question.id, status: "unanswered", symbol: question.symbol };
      }
      if (selected === question.answer) {
        return { id: question.id, status: "correct" };
      }
      return { id: question.id, status: "incorrect", symbol: question.symbol };
    });

    const score = details.filter((item) => item.status === "correct").length;
    let message = "本文をもう一度読み直してみましょう。";
    if (score === 5) {
      message = "満点です！ よくできました。";
    } else if (score >= 4) {
      message = "よくできました！";
    } else if (score >= 3) {
      message = "あと少しです。重要語句を復習してみましょう。";
    }

    setResult({ score, message, details });
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function resetQuiz() {
    setAnswers({});
    setResult(null);
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/menu">メニューへ戻る</Link>
        <BoredomDetector />
        <div className={styles.navActions}>
          <button
            type="button"
            className={styles.chatToggle}
            aria-expanded={chatOpen}
            aria-controls="chatgpt-pane"
            onClick={() => setChatOpen((open) => !open)}
          >
            {chatOpen ? "ChatGPTを閉じる" : "ChatGPTを開く"}
          </button>
          {isAdminUser && <span className={styles.adminBadge}>管理者</span>}
        </div>
      </nav>

      <div
        ref={bodyRef}
        className={styles.body}
        data-chat-open={chatOpen ? "true" : "false"}
        data-resizing={resizing ? "true" : "false"}
        style={chatOpen ? { "--chat-width": `${chatWidth}px` } : undefined}
      >
      <div className={styles.mainScroll}>
      <div ref={contentRef} className={styles.container}>
        <h1>1.2　半導体は何に使われている？</h1>
        <p>
          私たちの身の回りには、多くの半導体が使われています。例えば、スマートフォン、パソコン、テレビ、ゲーム機、自動車、エアコン、冷蔵庫、産業用ロボットなどです。
        </p>
        <p>
          さらに、インターネット、生成AI、クラウドコンピューティング、データセンターなど、一見すると半導体が見えないサービスにも、実際には大量の半導体が使われています。
        </p>
        <div className={styles.point}>
          <strong>重要ポイント</strong>
          <br />
          現代社会は、
          <strong>「半導体によって情報を集め、処理し、通信し、現実世界を制御する社会」</strong>
          になっています。
        </div>

        <h2>1.2.1　半導体は何に使われているかを考えてみよう</h2>
        <p>
          半導体の役割を理解するには、私たちの社会を大きく、
          <strong>サイバー空間</strong>
          と
          <strong>フィジカル空間</strong>
          の二つに分けて考えると分かりやすくなります。
        </p>

        <h3>サイバー空間</h3>
        <p>
          <span className={styles.term}>サイバー空間（cyberspace）</span>
          とは、コンピュータやネットワーク上に作られる情報の世界です。
        </p>
        <p>
          例えば、インターネット、クラウド、SNS、オンラインショッピング、オンラインゲーム、生成AI、データセンター、デジタル地図などがあります。
        </p>
        <p>
          私たちがスマートフォンで写真を送信すると、その写真は通信ネットワークを通り、サーバーやデータセンターで処理・保存されます。
        </p>
        <p>
          そこでは、CPU、GPU、メモリ、通信ICなど、さまざまな半導体が働いています。
        </p>

        <h3>AIと半導体</h3>
        <p>
          AIでは大量のデータを高速に計算する必要があります。そのため、CPU、GPU、NPU、AIアクセラレータ、HBMなどの高性能な半導体が利用されています。
        </p>
        <p>例えば生成AIに質問すると、</p>
        <p>
          <strong>質問を送信 → データセンターへ送る → AI用半導体で計算 → 回答を生成 → ネットワークを通して返す</strong>
        </p>
        <p>
          という処理が行われます。つまり、サイバー空間も物理的には大量の半導体によって支えられています。
        </p>

        <h3>フィジカル空間</h3>
        <p>
          <span className={styles.term}>フィジカル空間（physical space）</span>
          とは、私たちが実際に生活している現実世界です。
        </p>
        <p>
          例えば、人、自動車、道路、工場、建物、農地、ロボット、家電などが存在する世界です。
        </p>

        <h3>センサ</h3>
        <p>
          現実世界の状態をコンピュータで扱うためには、まず情報を取得する必要があります。そこで使用されるのが
          <span className={styles.term}>センサ</span>
          です。
        </p>
        <table>
          <thead>
            <tr>
              <th>センサ</th>
              <th>測定するもの</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>温度センサ</td>
              <td>温度</td>
            </tr>
            <tr>
              <td>圧力センサ</td>
              <td>圧力</td>
            </tr>
            <tr>
              <td>イメージセンサ</td>
              <td>画像</td>
            </tr>
            <tr>
              <td>加速度センサ</td>
              <td>動き・加速度</td>
            </tr>
            <tr>
              <td>LiDAR</td>
              <td>距離・周囲の形状</td>
            </tr>
            <tr>
              <td>マイク</td>
              <td>音</td>
            </tr>
          </tbody>
        </table>
        <p>
          センサによって、温度、光、音、距離、圧力、動きなどの物理現象を電気信号やデジタルデータへ変換します。
        </p>

        <h3>マイコン</h3>
        <p>
          センサから取得した情報を処理するために使われる代表的な半導体が
          <span className={styles.term}>マイクロコントローラ（マイコン）</span>
          です。
        </p>
        <p>例えばエアコンでは、</p>
        <p>
          <strong>温度センサ → マイコン → 温度判断 → モーター・コンプレッサ制御</strong>
        </p>
        <p>という処理が行われます。</p>

        <h3>パワー半導体</h3>
        <p>
          モーターや大きな電力を制御するときには
          <span className={styles.term}>パワー半導体</span>
          が重要です。
        </p>
        <p>
          電気自動車、鉄道、産業用ロボット、エアコン、太陽光発電などでは、MOSFET、IGBT、SiC、GaNなどの半導体技術が利用されています。
        </p>

        <h2>サイバー空間とフィジカル空間をつなぐ半導体</h2>
        <p>
          現在の社会では、サイバー空間とフィジカル空間は独立しているわけではありません。
        </p>
        <p>
          例えばスマート工場では、温度、振動、電流、画像などのデータをセンサで取得し、その情報をネットワーク経由でコンピュータやクラウドへ送ります。AIが分析した結果をもとに、作業員へ知らせたり、機械を停止したりすることができます。
        </p>
        <div className={styles.point}>
          <strong>現実世界 → データ化 → サイバー空間 → AIによる分析 → 現実世界を制御</strong>
          <br />
          <br />
          この循環を実現するために、センサ、マイコン、通信半導体、CPU、GPU、メモリ、パワー半導体などが必要です。
        </div>

        <h2>Society 5.0</h2>
        <p>
          <span className={styles.term}>Society 5.0（ソサエティ5.0）</span>
          は、日本が提唱している将来社会の考え方です。
        </p>
        <p>
          Society 5.0では、サイバー空間とフィジカル空間を高度に融合し、経済発展と社会的課題の解決を両立する、人間中心の社会を目指します。
        </p>
        <table>
          <thead>
            <tr>
              <th>社会</th>
              <th>名称</th>
              <th>特徴</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Society 1.0</td>
              <td>狩猟社会</td>
              <td>狩猟・採集</td>
            </tr>
            <tr>
              <td>Society 2.0</td>
              <td>農耕社会</td>
              <td>農業・定住</td>
            </tr>
            <tr>
              <td>Society 3.0</td>
              <td>工業社会</td>
              <td>工場・大量生産</td>
            </tr>
            <tr>
              <td>Society 4.0</td>
              <td>情報社会</td>
              <td>コンピュータ・インターネット</td>
            </tr>
            <tr>
              <td>Society 5.0</td>
              <td>超スマート社会</td>
              <td>サイバー空間とフィジカル空間の融合</td>
            </tr>
          </tbody>
        </table>

        <h2>Society 5.0で実現する社会</h2>
        <div className={styles.figure}>
          <img
            src="/images/society50.png"
            alt="Society 5.0で実現する社会。フィジカル空間とサイバー空間が循環し、人間中心の社会を実現する図"
          />
          <div className={styles.figcap}>
            図：Society 5.0で実現する社会 ― サイバー空間とフィジカル空間を融合し、人間中心の社会を実現する。
          </div>
        </div>
        <p>この図で特に注目したいのは、情報が一方向に流れるのではなく、</p>
        <p>
          <strong>フィジカル空間 → サイバー空間 → フィジカル空間</strong>
        </p>
        <p>と循環していることです。</p>
        <p>
          センサやIoT機器が現実世界からデータを集め、クラウドやデータセンターに送信します。そのデータをAIが分析し、その結果を自動車、ロボット、工場設備、医療機器などへ戻します。
        </p>

        <h2>Society 5.0と半導体</h2>
        <table>
          <thead>
            <tr>
              <th>Society 5.0の機能</th>
              <th>使用される半導体の例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>情報を取得する</td>
              <td>イメージセンサ、MEMS、各種センサ</td>
            </tr>
            <tr>
              <td>情報を処理する</td>
              <td>CPU、マイコン、SoC</td>
            </tr>
            <tr>
              <td>AIで計算する</td>
              <td>GPU、NPU、AIアクセラレータ</td>
            </tr>
            <tr>
              <td>情報を記憶する</td>
              <td>DRAM、NANDフラッシュ、HBM</td>
            </tr>
            <tr>
              <td>情報を送る</td>
              <td>通信IC、RF半導体</td>
            </tr>
            <tr>
              <td>機械を動かす</td>
              <td>パワー半導体</td>
            </tr>
            <tr>
              <td>電源を制御する</td>
              <td>MOSFET、SiC、GaN</td>
            </tr>
          </tbody>
        </table>
        <div className={styles.point}>
          Society 5.0は、
          <strong>半導体 → センサ → 通信 → AI → 制御</strong>
          という技術の組み合わせによって実現される社会と考えることができます。
        </div>

        <h2>Society 5.0で期待される分野</h2>
        <p>
          Society 5.0では、自動車、農業、医療、物流、防災、工場、エネルギーなど、社会のさまざまな分野でデジタル技術の活用が期待されています。
        </p>
        <p>
          例えば、自動車ではカメラ、LiDAR、レーダーなどの情報を半導体で処理し、運転支援や自動運転につなげます。
        </p>
        <p>
          農業では、センサやドローンから取得した情報をAIで分析し、作物の状態に応じて水や肥料を与えるスマート農業が考えられます。
        </p>
        <p>
          医療・介護では、ウェアラブルセンサやロボット、AIなどを活用できます。
        </p>
        <p>
          工場では、センサ、AI、産業用ロボットを組み合わせたスマートファクトリーが進められています。
        </p>

        <div className={styles.summary}>
          <h2>1.2　まとめ</h2>
          <p>半導体の役割は、次の5つに整理できます。</p>
          <ol>
            <li>
              <strong>感じる</strong>
              ：センサで現実世界の情報を取得する。
            </li>
            <li>
              <strong>考える</strong>
              ：CPU、GPU、マイコンなどで情報を処理する。
            </li>
            <li>
              <strong>覚える</strong>
              ：メモリに情報を保存する。
            </li>
            <li>
              <strong>伝える</strong>
              ：通信半導体で情報を送受信する。
            </li>
            <li>
              <strong>動かす</strong>
              ：パワー半導体などでモーターや機械を制御する。
            </li>
          </ol>
          <p>
            <strong>
              半導体は単なる電子部品ではなく、サイバー空間とフィジカル空間を結び付けるSociety 5.0の基盤技術です。
            </strong>
          </p>
        </div>

        <section className={styles.quiz}>
          <h2>1.2　4択小テスト</h2>
          <p>
            各問題について、最も適切なものを①～④から1つ選び、最後に「採点する」をクリックしてください。
          </p>

          {QUESTIONS.map((question) => (
            <div key={question.id} className={styles.question}>
              <div className={styles.questionTitle}>{question.title}</div>
              <p>{question.prompt}</p>
              {question.options.map((option) => (
                <label key={option.value} className={styles.option}>
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={answers[question.id] === option.value}
                    onChange={() => handleChange(question.id, option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          ))}

          <div className={styles.buttonArea}>
            <button
              className={styles.gradeButton}
              type="button"
              onClick={gradeQuiz}
            >
              採点する
            </button>
            <button
              className={styles.resetButton}
              type="button"
              onClick={resetQuiz}
            >
              もう一度挑戦する
            </button>
          </div>

          {result && (
            <div ref={resultRef} className={styles.result}>
              <div>5問中 {result.score}問正解</div>
              <div className={styles.scoreMessage}>{result.message}</div>
              <div className={styles.answerDetail}>
                {result.details.map((item, index) => (
                  <p key={item.id}>
                    第{index + 1}問：
                    {item.status === "correct" && (
                      <span className={styles.correct}>○ 正解</span>
                    )}
                    {item.status === "incorrect" && (
                      <>
                        <span className={styles.incorrect}>× 不正解</span>
                        　正解：{item.symbol}
                      </>
                    )}
                    {item.status === "unanswered" && (
                      <>
                        <span className={styles.unanswered}>未回答</span>
                        　正解：{item.symbol}
                      </>
                    )}
                  </p>
                ))}
              </div>
            </div>
          )}
        </section>

        {children}

        <footer className={styles.footer}>
          高校生のための半導体専門書 ― 1.2 半導体は何に使われている？
        </footer>
      </div>
      </div>

        <aside
          id="chatgpt-pane"
          className={styles.chatPane}
          hidden={!chatOpen}
          aria-hidden={!chatOpen}
        >
          <div
            className={styles.resizeHandle}
            role="separator"
            aria-orientation="vertical"
            aria-label="ChatGPT欄の幅を変更"
            aria-valuenow={chatWidth}
            aria-valuemin={MIN_CHAT_WIDTH}
            tabIndex={0}
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
          />
          <ChatPrompt contentRef={contentRef} />
        </aside>
      </div>
    </div>
  );
}
