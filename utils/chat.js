"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const MAX_HISTORY = 20;
const MAX_CONTENT = 4000;
const MAX_PAGE_TEXT = 12000;

function sanitizePageText(pageText) {
  if (typeof pageText !== "string") {
    return "";
  }

  return pageText.replace(/[ \t]+\n/g, "\n").trim().slice(0, MAX_PAGE_TEXT);
}

function buildSystemPrompt(pageText) {
  const base =
    "あなたは半導体技術者検定4級の学習アシスタントです。高校生にも分かる日本語で、簡潔に正確に答えてください。直前の会話の流れを踏まえて答えてください。";

  if (!pageText) {
    return base;
  }

  return `${base}

次の本文はこの学習ページの左側に表示されている内容です。質問はこの本文に関するものとして、本文に基づいて答えてください。本文に書かれていないことは推測しすぎず、その旨を伝えてください。

【このページの本文】
${pageText}`;
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim() !== "",
    )
    .slice(-MAX_HISTORY)
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_CONTENT),
    }));
}

export async function askChatGPT(prompt, history = [], pageText = "") {
  if (typeof prompt !== "string" || prompt.trim() === "") {
    return { error: "質問を入力してください。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "APIキーが設定されていません。" };
  }

  const question = prompt.trim().slice(0, MAX_CONTENT);
  const messages = [
    {
      role: "system",
      content: buildSystemPrompt(sanitizePageText(pageText)),
    },
    ...sanitizeHistory(history),
    {
      role: "user",
      content: question,
    },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
    }),
  });

  if (!response.ok) {
    return { error: "回答の取得に失敗しました。時間をおいて再試行してください。" };
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    return { error: "回答を取得できませんでした。" };
  }

  return { answer };
}
