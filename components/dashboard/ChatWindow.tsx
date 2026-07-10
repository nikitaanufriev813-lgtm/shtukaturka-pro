"use client";

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  text: string | null;
  createdAt: string;
  senderId: string;
  sender: { name: string; role: string };
}

export function ChatWindow({
  projectId,
  currentUserId,
}: {
  projectId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch(`/api/projects/${projectId}/messages`);
    if (res.ok) {
      setMessages(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMessages();
    // Простой поллинг раз в 5 секунд — для MVP этого достаточно,
    // полноценный реал-тайм можно позже подключить через Supabase Realtime/Pusher.
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    const res = await fetch(`/api/projects/${projectId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setText("");
    }
    setSending(false);
  }

  return (
    <div className="card flex h-[70vh] flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        {loading && <p className="text-sm text-gray-400">Загружаем сообщения…</p>}

        {!loading && messages.length === 0 && (
          <p className="text-sm text-gray-400">
            Сообщений пока нет. Напишите менеджеру — он ответит в ближайшее время.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMine
                    ? "ml-auto bg-brand text-white"
                    : "bg-gray-100 dark:bg-white/5"
                }`}
              >
                {!isMine && (
                  <p className="mb-0.5 text-xs font-semibold text-accent">{msg.sender.name}</p>
                )}
                <p>{msg.text}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    isMine ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-100 p-3 dark:border-white/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите сообщение..."
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="btn-tap rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50"
        >
          Отправить
        </button>
      </form>
    </div>
  );
}
