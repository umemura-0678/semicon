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
    prompt: "半導体の品質管理について、最も適切なものはどれですか。",
    options: [
      { value: "1", label: "① 完成した製品だけを検査すればよい" },
      { value: "2", label: "② 製造工程の途中から条件を監視し、不良を作り込まないことが重要である" },
      { value: "3", label: "③ 半導体は機械部品ではないため品質管理は必要ない" },
      { value: "4", label: "④ 不良品が発生した場合だけ製造条件を記録する" },
    ],
    answer: "2",
    symbol: "②",
  },
  {
    id: "q2",
    title: "第2問",
    prompt: "ISO 9001について正しい説明はどれですか。",
    options: [
      { value: "1", label: "① 自動車専用の機能安全規格である" },
      { value: "2", label: "② 半導体の回路設計方法を定めた規格である" },
      { value: "3", label: "③ 品質マネジメントシステムに関する国際規格である" },
      { value: "4", label: "④ EUの有害物質使用制限指令である" },
    ],
    answer: "3",
    symbol: "③",
  },
  {
    id: "q3",
    title: "第3問",
    prompt: "自動車の電気・電子システムにおける機能安全を扱う規格はどれですか。",
    options: [
      { value: "1", label: "① ISO 26262" },
      { value: "2", label: "② RoHS" },
      { value: "3", label: "③ ISO 9001" },
      { value: "4", label: "④ USB" },
    ],
    answer: "1",
    symbol: "①",
  },
  {
    id: "q4",
    title: "第4問",
    prompt: "RoHS指令の主な目的として最も適切なものはどれですか。",
    options: [
      { value: "1", label: "① 半導体の動作速度を規定する" },
      { value: "2", label: "② 電気・電子機器に含まれる特定有害物質の使用を制限する" },
      { value: "3", label: "③ 自動車の最高速度を制限する" },
      { value: "4", label: "④ 半導体工場の生産量を決める" },
    ],
    answer: "2",
    symbol: "②",
  },
  {
    id: "q5",
    title: "第5問",
    prompt: "半導体製造におけるトレーサビリティの説明として正しいものはどれですか。",
    options: [
      { value: "1", label: "① 半導体の処理速度を高速化する技術" },
      { value: "2", label: "② 製品の販売価格を決定する仕組み" },
      { value: "3", label: "③ 製品の製造履歴や使用材料などを後から追跡できる仕組み" },
      { value: "4", label: "④ 半導体を静電気から保護する包装方法" },
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
        <h1>1.3　半導体を安心して使うためには？</h1>
        <p>
          半導体は、スマートフォンや家電だけでなく、自動車、医療機器、鉄道、航空機、産業用ロボット、通信設備など、社会を支えるさまざまな機器に使われています。
        </p>
        <p>
          もし半導体が突然故障すると、機器が動かなくなるだけでなく、自動車や医療機器などでは人の安全に影響する可能性があります。また、半導体は世界各地で原材料の調達、設計、製造、組立、検査、輸送などが行われるため、一つの企業だけで品質を保証することはできません。
        </p>
        <div className={styles.point}>
          <strong>重要ポイント</strong>
          <br />
          半導体を安心して使うためには、
          <strong>品質管理・試験 → サイバーセキュリティ → 国際規格 → サプライチェーン管理</strong>
          という考え方が重要です。
        </div>

        <h2>1.3.1　厳格な品質管理と試験</h2>
        <p>
          半導体は非常に微細な構造を持っています。そのため、製造工程にわずかな異常があっただけでも、性能や寿命に影響することがあります。
        </p>
        <p>例えば、次のようなものが不良の原因になります。</p>
        <ul>
          <li>微細なごみや異物</li>
          <li>配線の断線</li>
          <li>配線間の短絡</li>
          <li>膜厚のばらつき</li>
          <li>不純物濃度のばらつき</li>
          <li>製造装置の条件変化</li>
        </ul>

        <h3>主な試験</h3>

        <h4>① 外観検査</h4>
        <p>
          半導体表面やパッケージなどに傷、汚れ、欠け、異物などがないかを検査します。人による目視だけではなく、カメラや画像処理、AIを利用した自動外観検査も行われます。
        </p>

        <h4>② 電気特性試験</h4>
        <p>
          完成した半導体に電圧や電流を加え、設計された性能を満たしているか確認します。例えば、電圧、電流、抵抗、動作速度、消費電力などを測定します。
        </p>

        <h4>③ 温度試験</h4>
        <p>
          半導体は使用する環境によって温度が変化します。そこで、高温や低温の環境でも正常に動作するかを確認します。特に自動車では、夏の高温や冬の低温など厳しい環境で使用されるため、広い温度範囲での信頼性が求められます。
        </p>

        <h4>④ 信頼性試験</h4>
        <p>
          長期間使用しても故障しないかを確認する試験です。高温、高湿度、温度変化、電圧ストレスなど、実際の使用環境より厳しい条件を与えて故障の可能性を評価することがあります。このような試験を
          <span className={styles.term}>加速試験</span>
          と呼ぶことがあります。
        </p>

        <h4>⑤ バーンイン試験</h4>
        <p>
          半導体を一定時間、高温などの条件下で動作させ、使用開始直後に発生しやすい初期故障を発見する試験です。製品の用途や信頼性要求に応じて、試験方法や条件が決められます。
        </p>

        <div className={styles.point}>
          <strong>重要ポイント</strong>
          <br />
          半導体の品質管理では、完成品だけを検査するのではなく、
          <strong>製造途中から工程を監視し、不良を作り込まないこと</strong>
          が重要です。
        </div>

        <h2>1.3.2　サイバーセキュリティ対策</h2>
        <p>
          半導体の安全性を考えるとき、物理的な故障だけでなく、サイバー攻撃についても考える必要があります。
        </p>
        <p>
          現在では、自動車、工場、家電、IoT機器など、多くの装置がネットワークに接続されています。半導体を利用したシステムが攻撃されると、情報の盗難、機器の不正操作、システム停止、データ改ざんなどが発生する可能性があります。
        </p>
        <p>そのため、半導体や組込みシステムでは、次のような対策が重要です。</p>
        <ul>
          <li>暗号化</li>
          <li>認証</li>
          <li>セキュアブート</li>
          <li>アクセス制御</li>
          <li>ファームウェア更新</li>
          <li>脆弱性対策</li>
        </ul>

        <h3>セキュアブート</h3>
        <p>
          <span className={styles.term}>セキュアブート（Secure Boot）</span>
          は、機器を起動するときに、実行するソフトウェアが正規のものかを確認する仕組みです。不正に書き換えられたプログラムの実行を防ぐために利用されます。
        </p>

        <h3>ハードウェアによるセキュリティ</h3>
        <p>
          ソフトウェアだけではなく、半導体チップ内部に暗号鍵を安全に保存したり、暗号処理専用回路を搭載したりする方法もあります。
        </p>
        <div className={styles.point}>
          これからの半導体には、
          <strong>「正しく計算できること」＋「安全に計算できること」</strong>
          が求められます。
        </div>

        <h2>1.3.3　国際標準規格の遵守</h2>
        <p>
          半導体は世界中で設計・製造・販売されています。そのため、企業ごとに異なる方法で品質や安全性を判断するだけでは十分ではありません。そこで重要になるのが国際規格や各地域の法規制です。
        </p>

        <h3>（1）ISO 9001：品質マネジメントシステム</h3>
        <p>
          <span className={styles.term}>ISO 9001</span>
          は、組織が製品やサービスの品質を継続的に管理・改善するための品質マネジメントシステム（QMS）に関する国際規格です。
        </p>
        <div className={styles.flow}>計画する → 実行する → 評価する → 改善する</div>
        <p>
          半導体工場では、作業手順の標準化、記録の保存、不良原因の分析、是正処置、継続的改善などにつながります。
        </p>

        <h3>（2）IATF 16949：自動車産業向け品質マネジメントシステム</h3>
        <p>
          自動車には、エンジン制御、モーター制御、ブレーキ、エアバッグ、カメラ、レーダー、車内ネットワークなど、非常に多くの半導体が使用されています。
        </p>
        <p>
          <span className={styles.term}>IATF 16949</span>
          は、ISO 9001を基礎とした自動車産業向けの品質マネジメントシステムで、不良の予防やサプライチェーンにおけるばらつき・無駄の削減などを重視します。
        </p>

        <h3>（3）IEC 61508：機能安全規格</h3>
        <p>
          電子機器では、故障を完全になくすことは困難です。そこで、
          <strong>故障が発生しても危険な状態にならないようにする</strong>
          という考え方が重要になります。これを
          <span className={styles.term}>機能安全（Functional Safety）</span>
          といいます。
        </p>
        <p>
          <span className={styles.term}>IEC 61508</span>
          は、電気・電子・プログラマブル電子システムに関する機能安全の基本的な国際規格です。
        </p>
        <p>
          安全性の水準を表す考え方として、
          <span className={styles.term}>SIL（Safety Integrity Level）</span>
          が使われます。SIL1からSIL4まであり、要求されるリスク低減の程度に応じて安全機能を設計します。
        </p>

        <h3>（4）ISO 26262：自動車安全規格</h3>
        <p>
          <span className={styles.term}>ISO 26262</span>
          は、自動車の電気・電子システムにおける機能安全を扱う国際規格です。
        </p>
        <p>
          例えば、ブレーキ制御、ステアリング制御、モーター制御、エアバッグ、運転支援システムなどでは、電子回路や半導体の故障が安全に関係します。
        </p>
        <p>
          ISO 26262では、リスクに応じて
          <span className={styles.term}>ASIL（Automotive Safety Integrity Level）</span>
          という安全度水準を用います。
        </p>
        <div className={styles.flow}>ASIL A → ASIL B → ASIL C → ASIL D</div>

        <h3>（5）RoHS指令：特定有害物質使用制限指令</h3>
        <p>
          半導体や電子機器では、性能や安全性だけでなく環境への影響も考えなければなりません。
        </p>
        <p>
          <span className={styles.term}>RoHS指令</span>
          は、電気・電子機器に含まれる特定の有害物質の使用を制限するEUの制度です。
        </p>
        <p>
          半導体産業では、材料だけでなく、はんだ、端子、パッケージ材料などについても有害物質への対応が必要です。
        </p>
        <table>
          <thead>
            <tr>
              <th>規格・制度</th>
              <th>主な目的</th>
              <th>キーワード</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ISO 9001</td>
              <td>品質管理</td>
              <td>品質マネジメント</td>
            </tr>
            <tr>
              <td>IATF 16949</td>
              <td>自動車産業の品質管理</td>
              <td>自動車・不良予防</td>
            </tr>
            <tr>
              <td>IEC 61508</td>
              <td>機能安全</td>
              <td>SIL</td>
            </tr>
            <tr>
              <td>ISO 26262</td>
              <td>自動車の機能安全</td>
              <td>ASIL</td>
            </tr>
            <tr>
              <td>RoHS指令</td>
              <td>有害物質の使用制限</td>
              <td>環境・有害物質</td>
            </tr>
          </tbody>
        </table>
        <div className={styles.point}>
          <strong>注意</strong>
          <br />
          RoHSはISOやIECのような国際標準規格ではなく、EUの法令（指令）です。
        </div>

        <h2>1.3.4　サプライチェーンの管理と透明性</h2>
        <p>
          半導体は、一つの工場だけで完成するとは限りません。例えば、次のような長い工程を経て製品になります。
        </p>
        <div className={styles.flow}>
          原材料 → シリコンウェーハ → 回路設計 → 前工程 → 後工程 → 検査 → 輸送 → 電子機器メーカー
        </div>
        <p>
          このような原材料の調達から製品が利用者に届くまでの一連の流れを
          <span className={styles.term}>サプライチェーン（supply chain）</span>
          といいます。
        </p>

        <h3>（1）原材料の品質管理</h3>
        <p>
          半導体製造には、高純度シリコン、フォトレジスト、各種薬液、特殊ガス、金属材料、パッケージ材料など、多くの材料が使用されます。
        </p>
        <p>
          半導体は非常に微細な構造を作るため、原材料にわずかな不純物が含まれているだけでも製品の性能に影響することがあります。そのため、純度、成分、異物、供給元、製造ロットなどを厳しく管理します。
        </p>

        <h3>（2）製造プロセスの監視</h3>
        <p>
          半導体工場では、温度、圧力、ガス流量、膜厚、露光条件、寸法などの製造条件を常に監視します。
        </p>
        <p>
          製造条件が基準から外れた場合には、異常を早期に発見して不良品の大量発生を防ぐ必要があります。このような考え方では、
          <span className={styles.term}>SPC（Statistical Process Control：統計的工程管理）</span>
          も重要です。
        </p>

        <h3>（3）輸送と保管の適切な管理</h3>
        <p>
          完成した半導体も、輸送や保管方法が悪ければ品質が低下することがあります。特に注意する必要があるのが、静電気、湿気、高温、衝撃、振動、汚染です。
        </p>
        <p>
          半導体素子は静電気に弱いものが多いため、
          <span className={styles.term}>ESD（Electrostatic Discharge：静電気放電）対策</span>
          が重要です。
        </p>
        <p>
          例えば、帯電防止袋、導電性容器、接地、リストストラップなどが利用されます。
        </p>

        <h3>（4）トレーサビリティの確保</h3>
        <p>
          <span className={styles.term}>トレーサビリティ（traceability）</span>
          とは、製品が、いつ、どこで、どの材料を使い、どの装置で、どの条件で製造されたのかを後から追跡できるようにすることです。
        </p>
        <p>
          例えば、半導体に不具合が発生した場合、次のようにさかのぼって原因を調査できます。
        </p>
        <div className={styles.flow}>
          製品番号 → 製造ロット → ウェーハ → 製造装置 → 製造条件 → 原材料
        </div>
        <p>
          原因となった製造ロットが分かれば、影響する製品を特定して対策することができます。
        </p>
        <div className={styles.point}>
          <strong>トレーサビリティの目的</strong>
          <br />
          不良発生 → 製造履歴を追跡 → 原因を特定 → 影響範囲を確認 → 製品回収・工程改善 → 再発防止
        </div>

        <div className={styles.summary}>
          <h3>1.3　まとめ</h3>
          <p>半導体を安心して使用するためには、次の4つを組み合わせる必要があります。</p>
          <ol>
            <li>
              <strong>品質管理・試験</strong>
              ：製造工程を管理し、製品の性能と信頼性を確認する。
            </li>
            <li>
              <strong>サイバーセキュリティ</strong>
              ：不正アクセスやデータ改ざんなどからシステムを守る。
            </li>
            <li>
              <strong>規格・法規制への対応</strong>
              ：ISO 9001、IATF 16949、IEC 61508、ISO 26262、RoHSなどに対応する。
            </li>
            <li>
              <strong>サプライチェーン管理</strong>
              ：原材料から製造、輸送、保管までを管理し、トレーサビリティを確保する。
            </li>
          </ol>
          <div className={styles.flow}>
            原材料 → 製造 → 検査 → 輸送 → 使用 → 不具合情報 → 原因追跡 → 改善
          </div>
        </div>

        <section className={styles.quiz}>
          <h2>1.3　4択小テスト</h2>
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
          高校生のための半導体専門書 ― 1.3 半導体を安心して使うためには？
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
