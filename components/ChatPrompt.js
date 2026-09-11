"use client";

import { useEffect, useRef, useState } from "react";
import { askChatGPT } from "@/utils/chat";
import styles from "./ChatPrompt.module.css";

export default function ChatPrompt() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const prompt = formData.get("prompt");

    if (typeof prompt !== "string" || prompt.trim() === "") {
      setError("質問を入力してください。");
      return;
    }

    const question = prompt.trim();
    form.reset();
    setPending(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content: question }]);

    const result = await askChatGPT(question, messages);

    if (result.error) {
      setError(result.error);
    } else {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.answer },
      ]);
    }

    setPending(false);
  }

  return (
    <section className={styles.chat}>
      <h2>ChatGPTに質問する</h2>
      <p>この章の内容について、わからないことを質問できます。会話の続きも聞けます。</p>
      <div className={styles.messages}>
        {messages.length === 0 && !pending && (
          <p className={styles.empty}>質問を入力すると、ここに会話が表示されます。</p>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "user" ? styles.userMessage : styles.assistantMessage
            }
          >
            <div className={styles.role}>
              {message.role === "user" ? "あなた" : "ChatGPT"}
            </div>
            <div className={styles.bubble}>{message.content}</div>
          </div>
        ))}
        {pending && (
          <div className={styles.assistantMessage}>
            <div className={styles.role}>ChatGPT</div>
            <div className={styles.bubble}>考えています...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          name="prompt"
          rows={3}
          placeholder="質問を入力してください"
          required
          disabled={pending}
        />
        <button type="submit" disabled={pending}>
          {pending ? "考えています..." : "質問する"}
        </button>
      </form>
    </section>
  );
}
