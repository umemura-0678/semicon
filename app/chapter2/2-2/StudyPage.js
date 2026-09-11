"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ChatPrompt from "@/components/ChatPrompt";
import styles from "./page.module.css";

const DEFAULT_CHAT_WIDTH = 380;
const MIN_CHAT_WIDTH = 280;
const MIN_MAIN_WIDTH = 280;

const QUESTIONS = [
  {
    id: "q1",
    title: "第1問",
    prompt: "10 Ωの抵抗に5 Vの電圧を加えたとき、流れる電流はいくらですか。",
    options: [
      { value: "1", label: "① 0.05 A" },
      { value: "2", label: "② 0.5 A" },
      { value: "3", label: "③ 2 A" },
      { value: "4", label: "④ 50 A" },
    ],
    answer: "2",
    symbol: "②",
  },
  {
    id: "q2",
    title: "第2問",
    prompt: "キルヒホッフの第1法則（電流則）として正しいものはどれですか。",
    options: [
      { value: "1", label: "① 分岐点に流れ込む電流の合計と流れ出る電流の合計は等しい" },
      { value: "2", label: "② 抵抗が大きいほど必ず電流も大きくなる" },
      { value: "3", label: "③ 閉回路を一周すると抵抗値の合計は0になる" },
      { value: "4", label: "④ 並列回路ではすべての抵抗に同じ電流が流れる" },
    ],
    answer: "1",
    symbol: "①",
  },
  {
    id: "q3",
    title: "第3問",
    prompt: "100 Ωと200 Ωの抵抗を直列に接続したときの合成抵抗はいくらですか。",
    options: [
      { value: "1", label: "① 約66.7 Ω" },
      { value: "2", label: "② 100 Ω" },
      { value: "3", label: "③ 200 Ω" },
      { value: "4", label: "④ 300 Ω" },
    ],
    answer: "4",
    symbol: "④",
  },
  {
    id: "q4",
    title: "第4問",
    prompt: "100 Ωと100 Ωの抵抗を並列に接続したときの合成抵抗はいくらですか。",
    options: [
      { value: "1", label: "① 50 Ω" },
      { value: "2", label: "② 100 Ω" },
      { value: "3", label: "③ 200 Ω" },
      { value: "4", label: "④ 10,000 Ω" },
    ],
    answer: "1",
    symbol: "①",
  },
  {
    id: "q5",
    title: "第5問",
    prompt: "ホイートストンブリッジが平衡しているときの条件として正しいものはどれですか。",
    options: [
      { value: "1", label: "① R₁ + R₂ = R₃ + R₄" },
      { value: "2", label: "② R₁R₂ = R₃R₄" },
      { value: "3", label: "③ R₁ / R₂ = R₃ / R₄" },
      { value: "4", label: "④ R₁ + R₂ + R₃ + R₄ = 0" },
    ],
    answer: "3",
    symbol: "③",
  },
];

export default function StudyPage({ isAdminUser = false, children }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const [resizing, setResizing] = useState(false);
  const resultRef = useRef(null);
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
    let message = "教科書の内容をもう一度確認してみましょう。";
    if (score === 5) {
      message = "満点です！ よくできました。";
    } else if (score >= 4) {
      message = "よくできました！";
    } else if (score >= 3) {
      message = "あと少しです。復習してみましょう。";
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
      <div className={styles.container}>
        <h1>2.2　電気回路と半導体</h1>
        <p>
          半導体素子を理解するためには、電気回路の基本を理解する必要があります。ダイオードやトランジスタなどの半導体素子も、抵抗や電源などと組み合わせて回路として使用されます。
        </p>
        <p>
          ここでは、電気回路を解析するための基本となる
          <strong>オームの法則、キルヒホッフの法則、合成抵抗、ホイートストンブリッジ</strong>
          について学びます。
        </p>

        <h2>2.2.1　電気回路の基本</h2>

        <h3>（1）オームの法則</h3>
        <p>
          電気回路を考えるうえで最も基本となる法則が
          <strong>オームの法則（Ohm's law）</strong>
          です。
        </p>
        <div className={styles.formula}>V = RI</div>
        <table>
          <thead>
            <tr>
              <th>記号</th>
              <th>意味</th>
              <th>単位</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>V</td>
              <td>電圧</td>
              <td>V（ボルト）</td>
            </tr>
            <tr>
              <td>I</td>
              <td>電流</td>
              <td>A（アンペア）</td>
            </tr>
            <tr>
              <td>R</td>
              <td>抵抗</td>
              <td>Ω（オーム）</td>
            </tr>
          </tbody>
        </table>
        <p>式を変形すると、</p>
        <div className={styles.formula}>I = V / R</div>
        <div className={styles.formula}>R = V / I</div>

        <h4>例題</h4>
        <p>100 Ωの抵抗に5 Vの電圧を加えた場合、</p>
        <div className={styles.formula}>I = 5 / 100 = 0.05 A = 50 mA</div>
        <div className={styles.point}>
          <strong>重要ポイント</strong>
          <br />
          オームの法則は「電圧・電流・抵抗」の関係を表す、電気回路の最も基本的な法則です。
        </div>

        <h3>（2）キルヒホッフの法則</h3>
        <h4>① キルヒホッフの第1法則（電流則）</h4>
        <p>
          回路の分岐点では、
          <strong>流れ込む電流の合計＝流れ出る電流の合計</strong>
          となります。
        </p>
        <div className={styles.formula}>I₁ = I₂ + I₃</div>

        <h4>② キルヒホッフの第2法則（電圧則）</h4>
        <p>
          閉じた回路を一周したとき、電圧の上昇と電圧の降下の代数和は0になります。
        </p>
        <div className={styles.formula}>ΣV = 0</div>
        <div className={styles.point}>
          <strong>覚え方</strong>
          <br />
          第1法則（電流則）：分岐点で電流について考える
          <br />
          第2法則（電圧則）：回路を一周して電圧について考える
        </div>

        <h3>（3）合成抵抗</h3>
        <h4>① 直列接続</h4>
        <p>
          抵抗R₁、R₂、R₃を直列に接続した場合、合成抵抗Rは次のようになります。
        </p>
        <div className={styles.formula}>R = R₁ + R₂ + R₃</div>
        <p>直列回路では、すべての抵抗に同じ電流が流れます。</p>

        <h4>② 並列接続</h4>
        <p>抵抗R₁、R₂を並列に接続した場合、</p>
        <div className={styles.formula}>1 / R = 1 / R₁ + 1 / R₂</div>
        <p>2個の抵抗の場合は、</p>
        <div className={styles.formula}>R = (R₁R₂) / (R₁ + R₂)</div>
        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>直列接続</th>
              <th>並列接続</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>電流</td>
              <td>同じ</td>
              <td>分かれる</td>
            </tr>
            <tr>
              <td>電圧</td>
              <td>分かれる</td>
              <td>同じ</td>
            </tr>
            <tr>
              <td>合成抵抗</td>
              <td>各抵抗の和</td>
              <td>最小の抵抗より小さい</td>
            </tr>
          </tbody>
        </table>

        <h3>（4）ホイートストンブリッジ</h3>
        <p>
          <strong>ホイートストンブリッジ（Wheatstone bridge）</strong>
          は、抵抗値を精密に測定したり、抵抗値の小さな変化を電圧として検出したりするための回路です。
        </p>
        <div className={styles.figure}>
          <img
            src="/images/chapter2-2-wheatstone.png"
            alt="ホイートストンブリッジの回路図"
          />
          <div className={styles.caption}>図　ホイートストンブリッジの基本回路</div>
        </div>
        <p>
          図では、R₁、R₂、R₃、R₄の4個の抵抗をブリッジ状に接続し、A-C間に直流電源Eを接続します。また、B-D間には検流計G、または電圧計を接続します。
        </p>

        <h4>ブリッジの平衡</h4>
        <p>
          B点とD点の電位が等しくなると、B-D間の電圧は0となり、検流計には電流が流れません。この状態を
          <strong>ブリッジが平衡している</strong>
          といいます。
        </p>
        <div className={styles.formula}>R₁ / R₂ = R₃ / R₄</div>
        <p>または、</p>
        <div className={styles.formula}>R₁R₄ = R₂R₃</div>
        <p>この関係を利用することで、未知の抵抗値を求めることができます。</p>

        <h4>センサへの応用</h4>
        <p>
          ホイートストンブリッジは、抵抗値のわずかな変化を電圧として検出できるため、次のようなセンサに利用されています。
        </p>
        <ul className={styles.list}>
          <li>ひずみゲージ</li>
          <li>ロードセル</li>
          <li>圧力センサ</li>
          <li>温度センサ</li>
        </ul>
        <p>
          例えばロードセルでは、力が加わると内部のひずみゲージの抵抗値がわずかに変化します。するとブリッジの平衡が崩れ、B-D間に小さな電圧が発生します。この電圧をオペアンプなどの半導体回路で増幅し、マイコンなどで測定します。
        </p>

        <div className={styles.summary}>
          <h3>2.2.1　まとめ</h3>
          <p>
            電気回路を理解するうえで、オームの法則、キルヒホッフの法則、合成抵抗、ホイートストンブリッジは重要な基礎知識です。これらを理解することで、ダイオードやトランジスタなどの半導体素子を使った回路の解析や設計につなげることができます。
          </p>
        </div>

        <section className={styles.quiz}>
          <h2>2.2.1　小テスト</h2>
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
          高校生のための半導体専門書 ― 2.2 電気回路と半導体
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
          <ChatPrompt />
        </aside>
      </div>
    </div>
  );
}
