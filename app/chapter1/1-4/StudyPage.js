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
    prompt: "目標3「すべての人に健康と福祉を」と半導体との関係として、最も適切なものはどれですか。",
    options: [
      { value: "1", label: "① 半導体は医療機器には使用されない" },
      { value: "2", label: "② センサや半導体によって生体情報を測定・処理できる" },
      { value: "3", label: "③ 半導体を使用すると医師が不要になる" },
      { value: "4", label: "④ 半導体は医療情報を記録できない" },
    ],
    answer: "2",
    symbol: "②",
  },
  {
    id: "q2",
    title: "第2問",
    prompt: "目標7「エネルギーをみんなに そしてクリーンに」に特に関係する半導体はどれですか。",
    options: [
      { value: "1", label: "① パワー半導体" },
      { value: "2", label: "② イメージセンサだけ" },
      { value: "3", label: "③ LEDだけ" },
      { value: "4", label: "④ メモリだけ" },
    ],
    answer: "1",
    symbol: "①",
  },
  {
    id: "q3",
    title: "第3問",
    prompt: "目標12「つくる責任 つかう責任」に関係する取り組みとして最も適切なものはどれですか。",
    options: [
      { value: "1", label: "① 使用済み電子機器をすべて廃棄する" },
      { value: "2", label: "② 半導体製造で使用する水をできるだけ増やす" },
      { value: "3", label: "③ 電子機器から金属などを回収して再利用する" },
      { value: "4", label: "④ 製品をできるだけ短期間で廃棄する" },
    ],
    answer: "3",
    symbol: "③",
  },
  {
    id: "q4",
    title: "第4問",
    prompt: "目標15「陸の豊かさも守ろう」に半導体技術を活用する例として最も適切なものはどれですか。",
    options: [
      { value: "1", label: "① 人工衛星やドローンで森林を撮影し、AIで解析する" },
      { value: "2", label: "② 森林のデータをすべて削除する" },
      { value: "3", label: "③ センサを使わず森林の温度を測定する" },
      { value: "4", label: "④ 半導体を使って森林を減らす" },
    ],
    answer: "1",
    symbol: "①",
  },
  {
    id: "q5",
    title: "第5問",
    prompt: "半導体とSDGsの関係について、最も適切な説明はどれですか。",
    options: [
      { value: "1", label: "① 半導体を使用すれば自動的にすべてのSDGsが達成される" },
      { value: "2", label: "② 半導体とSDGsには関係がない" },
      { value: "3", label: "③ 半導体は社会課題の解決に役立つ一方、製造時の環境負荷にも配慮する必要がある" },
      { value: "4", label: "④ SDGsでは半導体を使用してはいけない" },
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
        <h1>1.4　半導体とSDGsの関係性</h1>
        <p>
          半導体は、スマートフォンやパソコンだけでなく、自動車、医療機器、工場、発電設備、通信機器、人工衛星など、社会のさまざまな場所で利用されています。
        </p>
        <p>
          そのため、半導体技術は私たちの生活を便利にするだけではなく、
          <strong>環境問題、エネルギー問題、医療、教育、産業、まちづくりなどの社会課題を解決するための重要な技術</strong>
          にもなっています。
        </p>
        <p>
          <span className={styles.term}>SDGs（Sustainable Development Goals：持続可能な開発目標）</span>
          は、2030年までに持続可能でよりよい世界を目指すために設定された17の目標です。
        </p>
        <div className={styles.point}>
          <strong>半導体とSDGsを考える二つの視点</strong>
          <br />
          ① 半導体技術を使って社会課題を解決すること
          <br />
          ② 半導体そのものを環境や社会に配慮して製造すること
        </div>
        <p>
          <strong>
            「半導体で持続可能な社会をつくる」ことと、「半導体を持続可能な方法でつくる」ことの両方が重要です。
          </strong>
        </p>

        <h2>1.4.1　半導体とSDGsの開発目標との関係</h2>

        <h3>目標3：すべての人に健康と福祉を</h3>
        <p>
          目標3では、人々が健康に生活できる社会を目指しています。現在の医療では、多くの半導体が利用されています。
        </p>
        <ul>
          <li>CT</li>
          <li>MRI</li>
          <li>超音波診断装置</li>
          <li>心電計</li>
          <li>血圧計</li>
          <li>血糖値測定器</li>
          <li>パルスオキシメータ</li>
          <li>ウェアラブル端末</li>
        </ul>
        <p>
          これらの機器では、センサによって体の状態を測定し、その信号を半導体で処理します。
        </p>
        <div className={styles.flow}>
          センサで測定 → 半導体で信号処理 → データ解析 → 医師の診断を支援
        </div>
        <p>
          また、通信技術と組み合わせることで、離れた場所から診察を受ける
          <strong>遠隔医療</strong>
          にも活用できます。
        </p>
        <div className={styles.point}>
          <strong>重要ポイント</strong>
          <br />
          半導体は「測る・処理する・伝える」という役割によって、医療を支えています。
        </div>

        <h3>目標4：質の高い教育をみんなに</h3>
        <p>
          目標4では、誰もが公平に質の高い教育を受けられる社会を目指しています。
        </p>
        <p>
          現在の学校では、パソコン、タブレット、電子黒板、プロジェクタ、インターネット、オンライン授業、AI学習システムなどのICTが利用されています。
        </p>
        <p>
          これらの機器には、CPU、メモリ、通信IC、イメージセンサなど、多くの半導体が使用されています。
        </p>
        <div className={styles.flow}>
          カメラ・マイク → パソコン・タブレット → インターネット → 離れた場所にいる生徒
        </div>
        <p>
          AIを活用すれば、生徒一人ひとりの理解度に応じた学習支援も可能になります。一方で、端末や通信環境を利用できる人と利用できない人との間に格差が生じないようにすることも重要です。
        </p>

        <h3>目標7：エネルギーをみんなに そしてクリーンに</h3>
        <p>
          目標7では、持続可能で環境への負荷が小さいエネルギーを利用できる社会を目指しています。
        </p>
        <p>
          ここで重要な役割を持つのが
          <span className={styles.term}>パワー半導体</span>
          です。
        </p>
        <p>
          太陽光発電や風力発電で作った電気は、そのままでは家庭や工場で利用できない場合があります。そのため、電圧や電流などを適切に変換する必要があります。
        </p>
        <ul>
          <li>MOSFET</li>
          <li>IGBT</li>
          <li>SiCパワーデバイス</li>
          <li>GaNパワーデバイス</li>
        </ul>
        <div className={styles.flow}>
          太陽光・風力 → 発電 → パワー半導体で電力変換 → 家庭・工場で利用
        </div>
        <p>
          特にSiCやGaNを利用したパワー半導体は、高効率な電力変換を実現する技術として注目されています。
        </p>

        <h3>目標8：働きがいも経済成長も</h3>
        <p>半導体産業は世界の経済や雇用にも大きく関係しています。</p>
        <div className={styles.flow}>
          研究 → 設計 → 材料 → 製造装置 → 半導体製造 → 組立 → 検査 → 販売
        </div>
        <p>
          さらに半導体を利用したAIやロボットによって、工場の危険な作業や単純な反復作業を自動化することもできます。
        </p>
        <div className={styles.flow}>
          人が行っていた危険な作業 → センサで周囲を確認 → コンピュータで判断 → ロボットが作業
        </div>
        <p>
          一方で、AIやロボットの普及によって仕事の内容が変化することも考えられます。そのため、新しい技術について学び続ける
          <strong>リスキリング（学び直し）</strong>
          も重要になります。
        </p>

        <h3>目標9：産業と技術革新の基盤をつくろう</h3>
        <p>目標9は、半導体と特に関係の深いSDGsの一つです。</p>
        <p>
          現代の産業では、AI、ロボット、5Gなどの通信、自動車、医療機器、宇宙開発、スマートファクトリーなどの技術が発展しています。これらの技術の多くを支えているのが半導体です。
        </p>
        <div className={styles.flow}>
          センサ → データ収集 → 通信 → AIによる分析 → ロボット・製造装置を制御
        </div>
        <div className={styles.point}>
          <strong>重要ポイント</strong>
          <br />
          半導体は単なる電子部品ではなく、現代の産業と技術革新を支える基盤技術です。
        </div>

        <h3>目標10：人や国の不平等をなくそう</h3>
        <p>
          半導体を利用した情報通信技術は、人や地域によるさまざまな格差を小さくできる可能性があります。
        </p>
        <ul>
          <li>遠隔教育</li>
          <li>遠隔医療</li>
          <li>オンライン行政サービス</li>
          <li>電子決済</li>
          <li>災害情報の配信</li>
        </ul>
        <p>
          情報通信技術を利用できる人と利用できない人との格差を
          <span className={styles.term}>デジタルデバイド</span>
          といいます。
        </p>
        <div className={styles.point}>
          技術を開発することだけでなく、
          <strong>誰もが利用できる環境を整えること</strong>
          も重要です。
        </div>

        <h3>目標11：住み続けられるまちづくりを</h3>
        <p>
          目標11では、安全で災害に強く、環境にも配慮したまちづくりを目指しています。
        </p>
        <p>
          スマートシティでは、交通量センサ、防犯カメラ、環境センサ、スマート信号、自動運転、スマートメーター、河川監視システム、地震・気象観測システムなどが利用されます。
        </p>
        <div className={styles.flow}>
          センサ → 街の情報を収集 → 通信ネットワーク → AIによる分析 → 交通・防災・エネルギーなどを最適化
        </div>

        <h3>目標12：つくる責任 つかう責任</h3>
        <p>
          半導体を製造するためには、シリコン、金属、化学薬品、特殊ガス、大量の水、電力などが必要です。
        </p>
        <p>
          また、パソコンやスマートフォンなどが廃棄されると、
          <span className={styles.term}>電子廃棄物（E-waste）</span>
          になります。
        </p>
        <p>
          電子機器には、金・銀・銅などの有用な資源も含まれているため、これらを回収して再利用することが重要です。
        </p>
        <div className={styles.flow}>資源 → 製造 → 製品 → 使用 → 回収 → 再利用 ↺</div>
        <p>
          このように資源を循環させる考え方を
          <strong>循環型社会</strong>
          といいます。
        </p>

        <h3>目標13：気候変動に具体的な対策を</h3>
        <p>
          地球温暖化を抑えるためには、温室効果ガスの排出量を減らすことが重要です。半導体は、省エネルギー化を通じて気候変動対策に貢献できます。
        </p>
        <ul>
          <li>電気自動車</li>
          <li>エアコン</li>
          <li>冷蔵庫</li>
          <li>データセンター</li>
          <li>太陽光発電</li>
          <li>産業用モーター</li>
        </ul>
        <div className={styles.flow}>
          高効率な半導体 → 電力損失を減らす → 消費電力を減らす → CO₂排出量の削減につながる
        </div>
        <div className={styles.point}>
          <strong>重要ポイント</strong>
          <br />
          「省エネルギーに役立つ半導体を作る」だけでなく、
          <strong>「半導体を省エネルギーで作る」</strong>
          ことも重要です。
        </div>

        <h3>目標14：海の豊かさを守ろう</h3>
        <p>
          海洋環境を守るためには、海の状態を正確に観測することが重要です。
        </p>
        <ul>
          <li>水温センサ</li>
          <li>水質センサ</li>
          <li>GPS</li>
          <li>カメラ</li>
          <li>通信装置</li>
          <li>観測用人工衛星</li>
        </ul>
        <div className={styles.flow}>
          海洋センサ → 水温・水質などを測定 → 通信 → コンピュータで解析 → 海洋環境の変化を把握
        </div>

        <h3>目標15：陸の豊かさも守ろう</h3>
        <p>森林や生態系を守るためにも半導体技術が利用されています。</p>
        <ul>
          <li>人工衛星</li>
          <li>ドローン</li>
          <li>イメージセンサ</li>
          <li>GPS</li>
          <li>環境センサ</li>
          <li>AI</li>
        </ul>
        <div className={styles.flow}>
          人工衛星・ドローン → イメージセンサで撮影 → 画像データ → AIで解析 → 森林伐採・山火事などを発見
        </div>

        <h3>目標17：パートナーシップで目標を達成しよう</h3>
        <p>半導体は、一つの企業だけですべてを作ることが難しい製品です。</p>
        <div className={styles.flow}>
          半導体設計会社 → 材料メーカー → 製造装置メーカー → 半導体工場 → 組立・検査会社 → 電子機器メーカー
        </div>
        <p>
          さらに、企業、大学、研究機関、国、地域などが協力して新しい半導体技術を研究することもあります。
        </p>
        <div className={styles.point}>
          <strong>重要ポイント</strong>
          <br />
          半導体産業は、さまざまな企業・大学・研究機関・国が協力する、
          <strong>パートナーシップによって成り立つ産業</strong>
          といえます。
        </div>

        <h2>半導体とSDGsの関係を整理しよう</h2>
        <table>
          <thead>
            <tr>
              <th>SDGsの目標</th>
              <th>半導体との主な関係</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>目標3　すべての人に健康と福祉を</td>
              <td>医療機器、医療センサ、AIによる診断支援</td>
            </tr>
            <tr>
              <td>目標4　質の高い教育をみんなに</td>
              <td>PC、タブレット、オンライン教育</td>
            </tr>
            <tr>
              <td>目標7　エネルギーをみんなに そしてクリーンに</td>
              <td>パワー半導体、再生可能エネルギー</td>
            </tr>
            <tr>
              <td>目標8　働きがいも経済成長も</td>
              <td>半導体産業、工場自動化、雇用</td>
            </tr>
            <tr>
              <td>目標9　産業と技術革新の基盤をつくろう</td>
              <td>AI、通信、ロボットなどの産業基盤</td>
            </tr>
            <tr>
              <td>目標10　人や国の不平等をなくそう</td>
              <td>遠隔医療、遠隔教育、デジタルデバイド対策</td>
            </tr>
            <tr>
              <td>目標11　住み続けられるまちづくりを</td>
              <td>スマートシティ、交通、防災</td>
            </tr>
            <tr>
              <td>目標12　つくる責任 つかう責任</td>
              <td>省資源、リサイクル、電子廃棄物対策</td>
            </tr>
            <tr>
              <td>目標13　気候変動に具体的な対策を</td>
              <td>省電力化、CO₂排出量削減</td>
            </tr>
            <tr>
              <td>目標14　海の豊かさを守ろう</td>
              <td>海洋観測、環境センサ</td>
            </tr>
            <tr>
              <td>目標15　陸の豊かさも守ろう</td>
              <td>衛星、ドローン、森林監視</td>
            </tr>
            <tr>
              <td>目標17　パートナーシップで目標を達成しよう</td>
              <td>国際協力、産学官連携、サプライチェーン</td>
            </tr>
          </tbody>
        </table>

        <h2>半導体とSDGsを考えるときの重要なポイント</h2>
        <p>
          半導体はSDGsの達成に役立つ技術ですが、
          <strong>半導体を使えば、それだけでSDGsを達成できるわけではありません。</strong>
        </p>
        <h3>半導体を「使う側」</h3>
        <p>
          半導体技術を利用して、医療、教育、省エネルギー、スマートシティ、環境監視などの社会課題を解決します。
        </p>
        <h3>半導体を「作る側」</h3>
        <p>
          省エネルギー、節水、資源の有効利用、廃棄物削減、リサイクル、適切な労働環境などに配慮して半導体を製造します。
        </p>

        <div className={styles.summary}>
          <h2>1.4　まとめ</h2>
          <p>半導体は、SDGsの多くの目標と関係しています。その役割は次のように整理できます。</p>
          <ul>
            <li>
              <strong>感じる</strong> → センサ
            </li>
            <li>
              <strong>考える</strong> → CPU・GPU・AI半導体
            </li>
            <li>
              <strong>覚える</strong> → メモリ
            </li>
            <li>
              <strong>伝える</strong> → 通信半導体
            </li>
            <li>
              <strong>動かす</strong> → パワー半導体
            </li>
          </ul>
          <p>
            これらの技術を医療、教育、エネルギー、産業、交通、環境保護などに活用することで、持続可能な社会の実現に貢献できます。
          </p>
          <p>
            <strong>
              半導体は「持続可能な社会を実現するための基盤技術」であると同時に、「半導体産業そのものも持続可能であること」が求められています。
            </strong>
          </p>
        </div>

        <section className={styles.quiz}>
          <h2>1.4　4択小テスト</h2>
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
          高校生のための半導体専門書 ― 1.4 半導体とSDGsの関係性
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
