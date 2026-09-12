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
    prompt: "真空管と比較したトランジスタの特徴として、最も適切なものはどれですか。",
    options: [
      { value: "1", label: "① 大型で消費電力が大きい" },
      { value: "2", label: "② 小型化や集積化がしやすい" },
      { value: "3", label: "③ 真空中でしか動作しない" },
      { value: "4", label: "④ スイッチングには使用できない" },
    ],
    answer: "2",
    symbol: "②",
  },
  {
    id: "q2",
    title: "第2問",
    prompt: "ムーアの法則について最も適切な説明はどれですか。",
    options: [
      { value: "1", label: "① 半導体の電圧は毎年2倍になるという物理法則" },
      { value: "2", label: "② 半導体工場の数が2年ごとに倍増するという法則" },
      { value: "3", label: "③ ICに搭載されるトランジスタ数が、およそ2年ごとに倍増してきたという経験則" },
      { value: "4", label: "④ 半導体の抵抗値が温度に比例するという法則" },
    ],
    answer: "3",
    symbol: "③",
  },
  {
    id: "q3",
    title: "第3問",
    prompt: "SoCの説明として最も適切なものはどれですか。",
    options: [
      { value: "1", label: "① 多くの機能を一つの半導体チップにまとめたもの" },
      { value: "2", label: "② 複数の工場を一つの会社に統合すること" },
      { value: "3", label: "③ シリコンを製造するための材料" },
      { value: "4", label: "④ 半導体を冷却するための装置" },
    ],
    answer: "1",
    symbol: "①",
  },
  {
    id: "q4",
    title: "第4問",
    prompt: "2026年現在、Rapidusが量産開始を目標として開発している先端ロジック半導体はどれですか。",
    options: [
      { value: "1", label: "① 200nm世代" },
      { value: "2", label: "② 20nm世代" },
      { value: "3", label: "③ 2nm世代" },
      { value: "4", label: "④ 0.02nm世代" },
    ],
    answer: "3",
    symbol: "③",
  },
  {
    id: "q5",
    title: "第5問",
    prompt: "将来の半導体技術として説明が正しいものはどれですか。",
    options: [
      { value: "1", label: "① チップレットは複数の小さなチップを組み合わせてシステムを構成する技術である" },
      { value: "2", label: "② GAAは真空管の一種である" },
      { value: "3", label: "③ SiCは半導体には使用できない" },
      { value: "4", label: "④ AIの普及によって半導体の必要性は低下する" },
    ],
    answer: "1",
    symbol: "①",
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
      <div className={styles.container}>
        <h1>第1章　社会の発展と半導体、半導体の品質管理</h1>

        <h2>1.1　半導体の過去、現在、未来</h2>
        <p>
          現代社会では、スマートフォン、コンピュータ、自動車、家電、通信機器、産業用ロボットなど、ほぼすべての電子機器に半導体が使用されています。
        </p>
        <p>
          半導体技術は、真空管からトランジスタ、集積回路（IC）、大規模集積回路（LSI）へと発展してきました。現在では、一つのチップの中に非常に多くのトランジスタを集積することが可能になっています。
        </p>
        <div className={styles.point}>
          <strong>重要ポイント</strong>
          <br />
          半導体の歴史は、
          <strong>「小型化 → 高集積化 → 高速化 → 低消費電力化 → システム化」</strong>
          の歴史と考えることができます。
        </div>

        <h2>1.1.1　半導体の過去</h2>

        <h3>（1）真空管</h3>
        <p>
          半導体が登場する以前、電子回路では
          <span className={styles.term}>真空管（vacuum tube）</span>
          が重要な役割を果たしていました。真空管は、内部を真空にしたガラス管の中で電子の流れを制御する電子部品です。
        </p>
        <p>
          主な働きには、電気信号の増幅、電流のON・OFF、発振、整流などがあります。初期のコンピュータにも大量の真空管が使用されました。
        </p>
        <p>
          一方で、真空管には大型、消費電力が大きい、発熱が多い、寿命が比較的短いなどの問題がありました。これらの欠点を大きく改善したのがトランジスタです。
        </p>

        <h3>（2）トランジスタ</h3>
        <p>
          1947年、米国ベル研究所でジョン・バーディーン、ウォルター・ブラッテン、ウィリアム・ショックレーらによって、トランジスタにつながる重要な発明が行われました。
        </p>
        <p>
          <span className={styles.term}>トランジスタ</span>
          は、半導体を利用して電流を制御する電子素子で、代表的な働きは
          <strong>増幅</strong>
          と
          <strong>スイッチング</strong>
          です。
        </p>
        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>真空管</th>
              <th>トランジスタ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>大きさ</td>
              <td>大きい</td>
              <td>小さい</td>
            </tr>
            <tr>
              <td>消費電力</td>
              <td>大きい</td>
              <td>小さい</td>
            </tr>
            <tr>
              <td>発熱</td>
              <td>大きい</td>
              <td>小さい</td>
            </tr>
            <tr>
              <td>寿命</td>
              <td>比較的短い</td>
              <td>長い</td>
            </tr>
            <tr>
              <td>集積化</td>
              <td>困難</td>
              <td>容易</td>
            </tr>
          </tbody>
        </table>

        <h3>（3）集積回路の基本特許</h3>
        <p>
          初期のトランジスタ回路では、トランジスタや抵抗などの部品を一つずつ配線していました。そこで、複数の電子素子を一つの半導体基板上にまとめるという考え方が登場しました。これが
          <span className={styles.term}>集積回路（IC：Integrated Circuit）</span>
          です。
        </p>
        <p>
          1958年にテキサス・インスツルメンツのジャック・キルビーが集積回路を実現し、1959年にはフェアチャイルド・セミコンダクターのロバート・ノイスがプレーナ技術を利用した集積回路を提案しました。これらの技術が、その後のIC産業発展の基礎となりました。
        </p>

        <h3>（4）ムーアの法則</h3>
        <p>
          1965年、後にインテルの共同創業者となるゴードン・ムーアは、集積回路に搭載される部品数が急速に増加していることを指摘しました。
        </p>
        <p>
          この傾向は
          <span className={styles.term}>ムーアの法則（Moore&apos;s Law）</span>
          と呼ばれ、一般には「半導体チップに搭載されるトランジスタ数は、およそ2年ごとに倍増する」という形で説明されます。
        </p>
        <div className={styles.point}>
          ムーアの法則は自然界の物理法則ではなく、半導体技術の長期的な進歩を表した
          <strong>経験則</strong>
          です。
        </div>

        <h3>（5）マイクロプロセッサ</h3>
        <p>
          ICの集積度が高くなると、コンピュータのCPU機能を一つのICにまとめることが可能になりました。これを
          <span className={styles.term}>マイクロプロセッサ（microprocessor）</span>
          といいます。
        </p>
        <p>
          1971年にはIntel 4004が登場し、コンピュータの小型化や低価格化が大きく進みました。現在では、家電、自動車、ロボット、工作機械などにも広く利用されています。
        </p>

        <h3>（6）スケーリング則</h3>
        <p>
          半導体では、トランジスタの寸法を小さくすることを
          <span className={styles.term}>微細化</span>
          といいます。MOSFETの寸法を一定の割合で縮小し、それに合わせて電圧なども調整することで、高集積化、高速化、低消費電力化を進める考え方が
          <span className={styles.term}>スケーリング則</span>
          です。
        </p>
        <p>
          しかし微細化が進むと、漏れ電流、発熱、量子トンネル効果、配線遅延、製造ばらつきなどの問題が大きくなります。そのため、トランジスタ構造も平面型MOSFETからFinFET、さらにGAAへと進化しています。
        </p>

        <h3>（7）大規模集積回路</h3>
        <p>
          多数のトランジスタを一つの半導体チップに集積した回路を
          <span className={styles.term}>LSI（Large Scale Integration：大規模集積回路）</span>
          といいます。
        </p>
        <div className={styles.flow}>SSI → MSI → LSI → VLSI → ULSI</div>
        <p>
          ただし、これらを分けるトランジスタ数に厳密で普遍的な境界があるわけではありません。現在のCPUやGPU、メモリは、かつてのLSIという言葉で想定された規模をはるかに超える集積度になっています。
        </p>

        <h2>1.1.2　日本における大規模集積回路開発の歴史</h2>
        <p>
          日本は1970年代から1990年代にかけて、世界の半導体産業で大きな存在感を持っていました。その背景には企業独自の研究開発だけでなく、企業、大学、国の研究機関が協力する研究開発プロジェクトがありました。
        </p>

        <h3>（1）システム・オン・チップ</h3>
        <p>
          半導体の集積度が高くなると、それまで複数のICで構成していた機能を一つのチップにまとめることが可能になります。これを
          <span className={styles.term}>SoC（System on Chip：システム・オン・チップ）</span>
          といいます。
        </p>
        <p>
          例えば、CPU、メモリ制御、通信回路、画像処理回路、各種インターフェースなどを一つのチップに統合できます。SoCはスマートフォン、デジタル家電、自動車、ネットワーク機器などで重要な技術となりました。
        </p>

        <h3>（2）代表的な日本の半導体に関するプロジェクトの変遷</h3>

        <h4>① 超LSI開発プロジェクト</h4>
        <p>
          1970年代、日本では次世代コンピュータに必要となる大規模集積回路技術の開発が重要な課題になりました。半導体メーカーなどが協力し、微細加工、露光、結晶、製造装置などの基盤技術を研究しました。
        </p>

        <h4>② 半導体理工学研究センター（STARC）</h4>
        <p>
          <span className={styles.term}>STARC</span>
          は、日本の半導体設計技術力の強化を目的として設立された研究組織です。大学との共同研究や半導体設計技術者の育成などを進め、あすかプロジェクトのSoC設計技術開発にも関わりました。
        </p>

        <h4>③ 半導体先端テクノロジーズ（Selete）</h4>
        <p>
          <span className={styles.term}>Selete</span>
          は、日本の半導体企業が共同して先端半導体プロセス技術を研究するための組織です。微細加工、トランジスタ、材料、評価技術などの共同研究が進められました。
        </p>

        <h4>④ 超先端電子技術開発機構（ASET）</h4>
        <p>
          <span className={styles.term}>ASET</span>
          は、先端電子技術の共同研究を推進した組織です。企業、大学、研究機関が協力し、次世代電子技術の研究開発を進めました。
        </p>

        <h4>⑤ あすかプロジェクト</h4>
        <p>
          2001年度から開始された
          <span className={styles.term}>あすかプロジェクト</span>
          では、先端半導体の製造技術だけでなく、SoCの設計技術も重要なテーマとなりました。
        </p>

        <h4>⑥ 半導体MIRAIプロジェクト</h4>
        <p>
          <span className={styles.term}>MIRAIプロジェクト</span>
          では、次世代半導体材料・プロセス技術について産学官が連携して研究開発を進めました。新しいトランジスタ構造、High-kゲート絶縁膜、微細加工、配線材料、計測、シミュレーションなどが研究対象となりました。
        </p>

        <h4>⑦ 先端SoC基盤技術開発</h4>
        <p>
          SoCの複雑化に対応するため、設計資産（IP）の再利用、EDA、検証、低消費電力設計などの基盤技術開発が重要になりました。
        </p>

        <h4>⑧ あすかⅡプロジェクト</h4>
        <p>
          2006年度からは
          <span className={styles.term}>あすかⅡプロジェクト</span>
          が開始され、先端SoCの設計・製造技術をさらに発展させる取り組みが進められました。
        </p>

        <div className={styles.flow}>
          超LSI開発
          <br />
          ↓
          <br />
          微細加工・製造技術の高度化
          <br />
          ↓
          <br />
          共同研究組織の形成
          <br />
          ↓
          <br />
          SoC・設計技術の高度化
          <br />
          ↓
          <br />
          ナノメートル世代の材料・プロセス研究
          <br />
          ↓
          <br />
          現在の最先端半導体開発
        </div>

        <h2>1.1.3　半導体の現在</h2>
        <p>
          現在、半導体は単なる電子部品ではなく、経済安全保障や産業競争力を左右する重要技術になっています。AI、データセンター、自動運転、ロボット、5G・6G、スマート工場などの発展には、高性能な半導体が欠かせません。
        </p>

        <h3>Rapidusプロジェクト</h3>
        <p>
          Rapidusは2022年に設立され、北海道千歳市に最先端ロジック半導体の研究・製造拠点IIMを整備しています。
        </p>
        <p>
          2025年4月にパイロットラインが稼働し、2025年7月には2nm世代GAAトランジスタの試作で電気特性が確認されました。2026年時点では、2027年の2nm世代ロジック半導体の量産開始を目標として開発が進められています。
        </p>
        <div className={styles.point}>
          <strong>GAA（Gate-All-Around）</strong>
          は、ゲートがチャネルを広く取り囲む構造を持つトランジスタです。非常に小さなトランジスタでも電流を精密に制御しやすいことが特徴です。
        </div>

        <h3>JASMプロジェクト</h3>
        <p>
          JASM（Japan Advanced Semiconductor Manufacturing）は、TSMCが過半数を出資して熊本県に設立した半導体製造会社です。ソニーセミコンダクタソリューションズ、デンソー、トヨタも出資しています。
        </p>
        <p>
          熊本の第1工場は量産を開始しており、第2工場も計画されています。自動車、産業機器、民生機器、HPCなど幅広い用途の半導体を国内で製造する拠点として期待されています。
        </p>

        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>Rapidus</th>
              <th>JASM</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>主な拠点</td>
              <td>北海道千歳市</td>
              <td>熊本県</td>
            </tr>
            <tr>
              <td>主な方向</td>
              <td>最先端ロジック</td>
              <td>幅広い産業向け半導体</td>
            </tr>
            <tr>
              <td>注目技術</td>
              <td>2nm世代、GAA</td>
              <td>成熟～先端プロセスの量産</td>
            </tr>
            <tr>
              <td>特徴</td>
              <td>日本発の最先端ロジック製造への挑戦</td>
              <td>TSMCの製造技術を日本国内で展開</td>
            </tr>
          </tbody>
        </table>

        <h2>1.1.4　半導体の未来</h2>

        <h3>① GAAなど新しいトランジスタ構造</h3>
        <p>
          平面型MOSFETからFinFET、さらにGAAへと、トランジスタは立体的な構造へ進化しています。
        </p>

        <h3>② チップレット</h3>
        <p>
          一枚の巨大なチップにすべての機能を詰め込むのではなく、機能ごとに製造した小さなチップを高速に接続して一つのシステムを構成する
          <span className={styles.term}>チップレット</span>
          技術が注目されています。
        </p>

        <h3>③ 3次元化</h3>
        <p>
          トランジスタ、メモリ、配線などを立体的に配置し、限られた面積により多くの機能を搭載する3D集積技術も重要になっています。
        </p>

        <h3>④ AI向け半導体</h3>
        <p>
          生成AIなどでは膨大な計算が必要になるため、CPUだけでなくGPU、NPU、AIアクセラレータなど、AI計算に特化した半導体の重要性が高まっています。
        </p>

        <h3>⑤ パワー半導体</h3>
        <p>
          電気自動車や再生可能エネルギーでは、大きな電力を効率よく制御する必要があります。そのため、SiC（炭化ケイ素）やGaN（窒化ガリウム）を利用したパワー半導体が重要になっています。
        </p>

        <h3>⑥ 半導体と社会</h3>
        <p>
          これからの半導体は、AI、ロボット、自動運転、医療、通信、エネルギー、宇宙など、ほぼすべての先端産業を支える基盤技術になります。
        </p>

        <div className={styles.summary}>
          <h3>1.1　まとめ</h3>
          <div className={styles.flow}>
            真空管
            <br />
            ↓
            <br />
            トランジスタ
            <br />
            ↓
            <br />
            IC
            <br />
            ↓
            <br />
            LSI
            <br />
            ↓
            <br />
            マイクロプロセッサ・SoC
            <br />
            ↓
            <br />
            微細化・FinFET
            <br />
            ↓
            <br />
            GAA・2nm世代
            <br />
            ↓
            <br />
            チップレット・3D集積・AI半導体
          </div>
          <p>
            日本では、
            <strong>
              超LSI開発 → 産学官による共同研究 → SoC・MIRAIなどの研究開発 → Rapidus・JASMなどによる国内製造基盤強化
            </strong>
            という流れで整理できます。
          </p>
        </div>

        <section className={styles.quiz}>
          <h2>1.1　4択小テスト</h2>
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

        <p className={styles.note}>
          ※ Rapidusに関する量産目標などの記述は、2026年時点で公表されている情報を基にしています。
        </p>

        {children}

        <footer className={styles.footer}>
          高校生のための半導体専門書 ― 第1章　社会の発展と半導体
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
