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
    prompt: "半導体の特徴として最も適切なものはどれですか。",
    options: [
      { value: "1", label: "① 常に電気をよく流す" },
      { value: "2", label: "② 常に電気をほとんど流さない" },
      { value: "3", label: "③ 条件によって電気の流れやすさを変えることができる" },
      { value: "4", label: "④ 電気を蓄えることしかできない" },
    ],
    answer: "3",
    symbol: "③",
  },
  {
    id: "q2",
    title: "第2問",
    prompt: "n型半導体で主に電流を運ぶキャリアはどれですか。",
    options: [
      { value: "1", label: "① 正孔" },
      { value: "2", label: "② 電子" },
      { value: "3", label: "③ 陽子" },
      { value: "4", label: "④ 中性子" },
    ],
    answer: "2",
    symbol: "②",
  },
  {
    id: "q3",
    title: "第3問",
    prompt: "p型半導体を作るために、シリコンに加える不純物の代表例はどれですか。",
    options: [
      { value: "1", label: "① リン（P）" },
      { value: "2", label: "② ホウ素（B）" },
      { value: "3", label: "③ 銅（Cu）" },
      { value: "4", label: "④ アルミニウム（Al）" },
    ],
    answer: "2",
    symbol: "②",
  },
  {
    id: "q4",
    title: "第4問",
    prompt: "ダイオードの基本的な性質として正しいものはどれですか。",
    options: [
      { value: "1", label: "① 電流を主に一方向へ流す" },
      { value: "2", label: "② 電気を完全に遮断する" },
      { value: "3", label: "③ 電流を必ず増幅する" },
      { value: "4", label: "④ 電圧を発生させるだけの素子である" },
    ],
    answer: "1",
    symbol: "①",
  },
  {
    id: "q5",
    title: "第5問",
    prompt: "次のうち、化合物半導体として使われる材料はどれですか。",
    options: [
      { value: "1", label: "① Si" },
      { value: "2", label: "② Cu" },
      { value: "3", label: "③ GaN" },
      { value: "4", label: "④ Fe" },
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
        <h1>第2章　半導体の物性と基礎</h1>
        <p>
          私たちの身の回りにあるスマートフォン、コンピュータ、自動車、家電製品などには、多くの半導体が使われている。半導体は、電気を「流す」「流さない」という状態を制御できるため、電子回路を構成する重要な材料である。
        </p>
        <p>
          本章では、まず物質としての半導体がどのような性質を持っているのかを学び、その性質を利用して作られるダイオードやトランジスタなどの電子素子について理解する。
        </p>

        <h2>2.1.1　物質としての半導体</h2>
        <h3>(1) 物質の電気の流れやすさ</h3>
        <p>
          物質には、電気を流しやすいものと流しにくいものがある。この違いは、物質内部で
          <strong>電荷を運ぶ粒子がどれくらい自由に移動できるか</strong>
          によって決まる。
        </p>
        <p>
          物質は電気の流れやすさによって、大きく
          <strong>導体、半導体、絶縁体</strong>
          に分類することができる。
        </p>
        <table>
          <thead>
            <tr>
              <th>分類</th>
              <th>電気の流れやすさ</th>
              <th>代表的な物質</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>導体</td>
              <td>非常に流れやすい</td>
              <td>銅、アルミニウム、銀</td>
            </tr>
            <tr>
              <td>半導体</td>
              <td>条件によって大きく変化する</td>
              <td>シリコン、ゲルマニウム</td>
            </tr>
            <tr>
              <td>絶縁体</td>
              <td>非常に流れにくい</td>
              <td>ガラス、ゴム、セラミックス</td>
            </tr>
          </tbody>
        </table>

        <h4>導体</h4>
        <p>
          <strong>導体（conductor）</strong>
          は、電気を流しやすい物質である。銅やアルミニウムなどの金属では、物質内部に比較的自由に移動できる電子が多く存在する。そのため、電圧を加えると電子が移動して電流が流れる。
        </p>

        <h4>絶縁体</h4>
        <p>
          <strong>絶縁体（insulator）</strong>
          は、電気を非常に流しにくい物質である。ゴム、ガラス、プラスチックなどでは、電子が原子との結合に強く束縛されており、自由に移動することが難しい。
        </p>

        <h4>電気抵抗と抵抗率</h4>
        <p>
          物質の電気の流れにくさを表す量の一つに
          <strong>電気抵抗 R</strong>
          がある。
        </p>
        <div className={styles.formula}>R = V / I</div>
        <p>
          さらに、材料そのものの電気の流れにくさを表す量を
          <strong>抵抗率 ρ</strong>
          という。
        </p>
        <div className={styles.formula}>R = ρL / A</div>

        <h3>(2) 半導体 ― 導体と絶縁体の間</h3>
        <p>
          <strong>半導体（semiconductor）</strong>
          とは、電気的な性質が導体と絶縁体の中間にあり、さらにその性質を外部から大きく変化させることができる物質である。
        </p>
        <p>
          代表的な半導体材料が
          <strong>シリコン（Si）</strong>
          である。そのほかに、ゲルマニウム（Ge）やガリウムヒ素（GaAs）などがある。
        </p>
        <p>
          半導体の電気的性質は、温度、光、電界、不純物の種類や量などによって変化する。純粋なシリコンに微量の別の元素を加える操作を
          <strong>ドーピング（doping）</strong>
          という。
        </p>
        <div className={styles.point}>
          <strong>重要ポイント</strong>
          <br />
          半導体は「電気を少し流す物質」ではなく、
          <strong>電気の流れを制御できる物質</strong>
          である。
        </div>

        <h2>2.1.2　半導体で作られる電子素子</h2>
        <p>
          半導体の電気的性質を利用すると、電流の流れる方向を制限したり、小さな電気信号で大きな電流を制御したりできる。
        </p>

        <h3>(1) n型半導体とp型半導体</h3>
        <p>
          純度の高いシリコンを
          <strong>真性半導体</strong>
          という。シリコン原子は4個の価電子を持ち、共有結合によって結晶を形成している。
        </p>

        <h4>n型半導体</h4>
        <p>
          シリコンにリン（P）などの5個の価電子を持つ元素を加えると、自由に動きやすい電子が1個余る。
          <strong>電子を主なキャリアとする半導体</strong>
          をn型半導体という。
        </p>

        <h4>p型半導体</h4>
        <p>
          シリコンにホウ素（B）などの3個の価電子を持つ元素を加えると、電子が1個不足する。この電子が不足した場所を
          <strong>正孔（hole、ホール）</strong>
          という。
          <strong>正孔を主なキャリアとする半導体</strong>
          をp型半導体という。
        </p>

        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>n型半導体</th>
              <th>p型半導体</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>主な不純物の例</td>
              <td>リン（P）</td>
              <td>ホウ素（B）</td>
            </tr>
            <tr>
              <td>主なキャリア</td>
              <td>電子</td>
              <td>正孔</td>
            </tr>
            <tr>
              <td>キャリアの電荷</td>
              <td>負</td>
              <td>正</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.point}>
          <strong>注意</strong>
          <br />
          n型半導体そのものが負に帯電し、p型半導体そのものが正に帯電しているわけではない。通常、半導体全体としては電気的に中性である。
        </div>

        <h3>(2) ダイオード</h3>
        <p>
          n型半導体とp型半導体を接合すると
          <strong>PN接合</strong>
          ができる。このPN接合を基本として作られる電子素子が
          <strong>ダイオード（diode）</strong>
          である。
        </p>
        <p>
          ダイオードには、
          <strong>電流を主に一方向へ流す性質</strong>
          がある。p型側をプラス、n型側をマイナスに接続する順方向バイアスでは電流が流れやすく、逆方向では通常ほとんど電流が流れない。
        </p>

        <h3>(3) トランジスタ</h3>
        <p>
          <strong>トランジスタ（transistor）</strong>
          は、半導体を利用して電流や電圧を制御する電子素子である。主な働きには、
          <strong>スイッチング</strong>
          と
          <strong>増幅</strong>
          がある。
        </p>
        <p>
          代表的なトランジスタには、バイポーラトランジスタ（BJT）と電界効果トランジスタ（FET）がある。特に現在の大規模集積回路では、FETの一種であるMOSFETが重要である。
        </p>

        <h3>(4) 化合物半導体</h3>
        <p>
          異なる種類の元素を組み合わせて作られる半導体を
          <strong>化合物半導体（compound semiconductor）</strong>
          という。
        </p>
        <table>
          <thead>
            <tr>
              <th>材料</th>
              <th>名称</th>
              <th>主な用途・特徴</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GaAs</td>
              <td>ガリウムヒ素</td>
              <td>高周波通信、光デバイス</td>
            </tr>
            <tr>
              <td>GaN</td>
              <td>窒化ガリウム</td>
              <td>LED、高周波・高電力デバイス</td>
            </tr>
            <tr>
              <td>SiC</td>
              <td>炭化ケイ素</td>
              <td>高耐圧・高温・パワーデバイス</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.summary}>
          <h3>2.1 まとめ</h3>
          <p>
            半導体は、単に導体と絶縁体の中間に位置する物質ではなく、
            <strong>電気の流れを人為的に制御できる材料</strong>
            である。シリコンに不純物を加えることでn型半導体とp型半導体を作ることができ、それらを組み合わせることでダイオードやトランジスタなどの電子素子が実現される。
          </p>
        </div>

        <section className={styles.quiz}>
          <h2>第2章　小テスト</h2>
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
          高校生のための半導体専門書 ― 第2章 半導体の物性と基礎
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
