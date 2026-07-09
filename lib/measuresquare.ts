import crypto from "crypto";

// MeasureSquare Cloud API требует три заголовка на каждый запрос:
// X-Application, X-Timestamp, X-Signature (HMAC-SHA256, base64).
// Ключи выдаются MeasureSquare после запроса на integration@measuresquare.com.

const MS_API_BASE = "https://cloud.measuresquare.com/api";
const APPLICATION_ID = process.env.MEASURESQUARE_APPLICATION_ID!;
const SECRET_KEY = process.env.MEASURESQUARE_SECRET_KEY!;

function buildSignature(timestamp: string): string {
  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(`${APPLICATION_ID}${timestamp}`);
  return hmac.digest("base64");
}

function authHeaders(): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  return {
    "X-Application": APPLICATION_ID,
    "X-Timestamp": timestamp,
    "X-Signature": buildSignature(timestamp),
    Accept: "application/json",
  };
}

export interface MeasureSquareRoom {
  name: string;
  areaSqm: number;
}

export interface MeasureSquareEstimateLine {
  roomName?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface MeasureSquareProject {
  id: string;
  address?: string;
  floorplanPdfUrl?: string;
  rooms: MeasureSquareRoom[];
  estimateLines: MeasureSquareEstimateLine[];
}

/**
 * Забирает полные данные проекта (план + смета) по его ID в MeasureSquare.
 * ID приходит в теле webhook-уведомления.
 */
export async function fetchMeasureSquareProject(
  msProjectId: string
): Promise<MeasureSquareProject> {
  const res = await fetch(`${MS_API_BASE}/projects/${msProjectId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`MeasureSquare API вернул ошибку ${res.status}`);
  }

  const data = await res.json();

  // Реальная структура ответа зависит от плана/версии API — уточняется
  // в Integration API Spec после получения доступа. Ниже — ожидаемая форма,
  // подогнать под фактический ответ при первом реальном вызове.
  return {
    id: data.id,
    address: data.address,
    floorplanPdfUrl: data.floorplan_pdf_url,
    rooms: (data.rooms ?? []).map((r: any) => ({
      name: r.name,
      areaSqm: r.area_sqm ?? r.area,
    })),
    estimateLines: (data.estimate_lines ?? []).map((l: any) => ({
      roomName: l.room_name,
      description: l.description,
      quantity: l.quantity,
      unit: l.unit,
      unitPrice: l.unit_price,
      total: l.total,
    })),
  };
}
