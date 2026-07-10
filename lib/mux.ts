// Mux Live Streaming: https://docs.mux.com/guides/stream-live-to-mux
// Нужен аккаунт на mux.com — там создаётся Access Token ID + Secret Key.

const MUX_API_BASE = "https://api.mux.com";
const TOKEN_ID = process.env.MUX_TOKEN_ID!;
const TOKEN_SECRET = process.env.MUX_TOKEN_SECRET!;

function authHeader(): string {
  return "Basic " + Buffer.from(`${TOKEN_ID}:${TOKEN_SECRET}`).toString("base64");
}

export interface MuxLiveStream {
  streamKey: string; // секрет — вводится в настройках камеры/энкодера
  playbackId: string; // публичный ID — используется в плеере клиента
  rtmpUrl: string; // адрес, куда камера пушит поток (rtmp://global-live.mux.com:5222/app)
}

/**
 * Создаёт новый постоянный live-стрим в Mux для объекта.
 * Вызывается один раз при подключении камеры к проекту.
 */
export async function createMuxLiveStream(): Promise<MuxLiveStream> {
  const res = await fetch(`${MUX_API_BASE}/video/v1/live-streams`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playback_policy: ["public"],
      new_asset_settings: { playback_policy: ["public"] },
      reconnect_window: 60,
    }),
  });

  if (!res.ok) {
    throw new Error(`Mux API вернул ошибку ${res.status}`);
  }

  const data = await res.json();
  const stream = data.data;

  return {
    streamKey: stream.stream_key,
    playbackId: stream.playback_ids[0]?.id,
    rtmpUrl: "rtmp://global-live.mux.com:5222/app",
  };
}

/**
 * Проверяет текущий статус стрима (идёт трансляция или нет).
 */
export async function getMuxLiveStreamStatus(muxLiveStreamId: string): Promise<string> {
  const res = await fetch(`${MUX_API_BASE}/video/v1/live-streams/${muxLiveStreamId}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) throw new Error(`Mux API вернул ошибку ${res.status}`);
  const data = await res.json();
  return data.data.status; // "idle" | "active" | "disconnected"
}
