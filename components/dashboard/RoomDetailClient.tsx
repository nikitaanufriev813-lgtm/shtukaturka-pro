"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, Calculator, Plus, Loader2 } from "lucide-react";

interface Mix {
  id: string;
  name: string;
  brand?: string | null;
  consumption10mm: number;
  consumption15mm: number;
  consumption20mm: number;
  consumption25mm: number;
  bagWeightKg: number;
  pricePerBag: number | null;
}

interface Primer {
  id: string;
  name: string;
  consumptionPerM2: number;
  unit: string;
  containerVolume: number;
  pricePerContainer: number | null;
}

interface RoomData {
  id: string;
  name: string;
  status: string;
  progressPercent: number;
  wallArea: number | null;
  floorArea: number | null;
  windowArea: number | null;
  perimeter: number | null;
  height: number | null;
  slopeLinearMeters: number | null;
  meshJointsMeters: number | null;
  thicknessMm: number | null;
  selectedMixId: string | null;
  selectedPrimerId: string | null;
  photos: { id: string; url: string }[];
  reports: { id: string; date: string; comment: string | null; wallsArea: number; ceilingArea: number }[];
}

interface CalcResult {
  netWallArea: number;
  mixBags: number;
  primerContainers: number;
  beaconsProfiles: number;
  meshRolls: number;
  slopeMixKg: number;
  lineItems: { key: string; description: string; quantity: number; unit: string; unitPrice: number; total: number }[];
  totalCost: number;
}

const statusLabels: Record<string, string> = {
  PENDING: "Ожидает",
  IN_PROGRESS: "В работе",
  DONE: "Готово",
};

export function RoomDetailClient({
  room,
  mixes: initialMixes,
  primers,
  canEdit,
}: {
  room: RoomData;
  mixes: Mix[];
  primers: Primer[];
  canEdit: boolean;
}) {
  const [form, setForm] = useState({
    name: room.name,
    wallArea: room.wallArea?.toString() ?? "",
    floorArea: room.floorArea?.toString() ?? "",
    windowArea: room.windowArea?.toString() ?? "",
    perimeter: room.perimeter?.toString() ?? "",
    height: room.height?.toString() ?? "2.7",
    slopeLinearMeters: room.slopeLinearMeters?.toString() ?? "",
    meshJointsMeters: room.meshJointsMeters?.toString() ?? "",
    thicknessMm: (room.thicknessMm ?? 15).toString(),
    selectedMixId: room.selectedMixId ?? "",
    selectedPrimerId: room.selectedPrimerId ?? "",
  });
  const [mixes, setMixes] = useState(initialMixes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [showNewMix, setShowNewMix] = useState(false);
  const [newMix, setNewMix] = useState({
    name: "",
    consumption10mm: "",
    consumption15mm: "",
    consumption20mm: "",
    consumption25mm: "",
    pricePerBag: "",
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photos, setPhotos] = useState(room.photos);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/rooms/${room.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        wallArea: form.wallArea ? parseFloat(form.wallArea) : null,
        floorArea: form.floorArea ? parseFloat(form.floorArea) : null,
        windowArea: form.windowArea ? parseFloat(form.windowArea) : null,
        perimeter: form.perimeter ? parseFloat(form.perimeter) : null,
        height: form.height ? parseFloat(form.height) : null,
        slopeLinearMeters: form.slopeLinearMeters ? parseFloat(form.slopeLinearMeters) : null,
        meshJointsMeters: form.meshJointsMeters ? parseFloat(form.meshJointsMeters) : null,
        thicknessMm: parseInt(form.thicknessMm, 10),
        selectedMixId: form.selectedMixId || null,
        selectedPrimerId: form.selectedPrimerId || null,
      }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  async function handleCalculate() {
    setCalculating(true);
    setCalcError(null);
    setCalcResult(null);
    const res = await fetch(`/api/rooms/${room.id}/calculate`);
    setCalculating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setCalcError(data.message ?? "Не удалось рассчитать");
      return;
    }
    setCalcResult(await res.json());
  }

  async function handleAddMix(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/mixes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMix),
    });
    if (res.ok) {
      const created = await res.json();
      setMixes((prev) => [...prev, created]);
      update("selectedMixId", created.id);
      setShowNewMix(false);
      setNewMix({ name: "", consumption10mm: "", consumption15mm: "", consumption20mm: "", consumption25mm: "", pricePerBag: "" });
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingPhoto(true);
    const body = new FormData();
    Array.from(e.target.files).forEach((f) => body.append("photos", f));
    const res = await fetch(`/api/rooms/${room.id}/photos`, { method: "POST", body });
    setUploadingPhoto(false);
    if (res.ok) {
      const updated = await res.json();
      setPhotos(updated.photos);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/plan"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand dark:hover:text-accent"
      >
        <ArrowLeft size={16} />
        Назад к плану квартиры
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <p className="text-sm text-gray-400">
            {statusLabels[room.status] ?? room.status} · {room.progressPercent}% готово
          </p>
        </div>
      </div>

      {/* Фото комнаты */}
      <section className="card mb-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Фото комнаты</h2>
          {canEdit && photos.length < 3 && (
            <label className="btn-tap flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-light">
              {uploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              Добавить фото
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
            </label>
          )}
        </div>
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.url} alt={room.name} className="aspect-square rounded-lg object-cover" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Фото пока не загружены (до 3 штук)</p>
        )}
      </section>

      {/* Параметры комнаты */}
      <section className="card mb-6 p-5">
        <h2 className="mb-4 font-semibold">Параметры комнаты</h2>

        {canEdit ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Название комнаты">
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Площадь стен, м²">
              <input
                type="number"
                step="0.1"
                value={form.wallArea}
                onChange={(e) => update("wallArea", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Площадь пола, м² (справочно)">
              <input
                type="number"
                step="0.1"
                value={form.floorArea}
                onChange={(e) => update("floorArea", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Площадь окон, м²">
              <input
                type="number"
                step="0.1"
                value={form.windowArea}
                onChange={(e) => update("windowArea", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Периметр стен, м">
              <input
                type="number"
                step="0.1"
                value={form.perimeter}
                onChange={(e) => update("perimeter", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Высота потолков, м">
              <input
                type="number"
                step="0.1"
                value={form.height}
                onChange={(e) => update("height", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Погонные метры откосов">
              <input
                type="number"
                step="0.1"
                value={form.slopeLinearMeters}
                onChange={(e) => update("slopeLinearMeters", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Погонные метры стыков (сетка)">
              <input
                type="number"
                step="0.1"
                value={form.meshJointsMeters}
                onChange={(e) => update("meshJointsMeters", e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Толщина слоя">
              <select
                value={form.thicknessMm}
                onChange={(e) => update("thicknessMm", e.target.value)}
                className="input"
              >
                {[10, 15, 20, 25].map((mm) => (
                  <option key={mm} value={mm}>
                    {mm} мм
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Грунтовка">
              <select
                value={form.selectedPrimerId}
                onChange={(e) => update("selectedPrimerId", e.target.value)}
                className="input"
              >
                <option value="">Не выбрана</option>
                {primers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Штукатурная смесь">
                <div className="flex gap-2">
                  <select
                    value={form.selectedMixId}
                    onChange={(e) => update("selectedMixId", e.target.value)}
                    className="input flex-1"
                  >
                    <option value="">Не выбрана</option>
                    {mixes.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.brand ? `(${m.brand})` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewMix((v) => !v)}
                    className="btn-tap flex items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm text-gray-500 hover:border-brand hover:text-brand dark:border-white/10 dark:hover:border-accent dark:hover:text-accent"
                  >
                    <Plus size={16} />
                    Своя смесь
                  </button>
                </div>
              </Field>
            </div>

            {showNewMix && (
              <form onSubmit={handleAddMix} className="sm:col-span-2 rounded-xl border border-dashed border-gray-200 p-4 dark:border-white/10">
                <p className="mb-3 text-sm font-medium">Добавить свою смесь</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <input
                    required
                    placeholder="Название"
                    value={newMix.name}
                    onChange={(e) => setNewMix((p) => ({ ...p, name: e.target.value }))}
                    className="input col-span-2 sm:col-span-3"
                  />
                  <input
                    required
                    type="number"
                    step="0.1"
                    placeholder="Расход 10мм, кг/м²"
                    value={newMix.consumption10mm}
                    onChange={(e) => setNewMix((p) => ({ ...p, consumption10mm: e.target.value }))}
                    className="input"
                  />
                  <input
                    required
                    type="number"
                    step="0.1"
                    placeholder="Расход 15мм"
                    value={newMix.consumption15mm}
                    onChange={(e) => setNewMix((p) => ({ ...p, consumption15mm: e.target.value }))}
                    className="input"
                  />
                  <input
                    required
                    type="number"
                    step="0.1"
                    placeholder="Расход 20мм"
                    value={newMix.consumption20mm}
                    onChange={(e) => setNewMix((p) => ({ ...p, consumption20mm: e.target.value }))}
                    className="input"
                  />
                  <input
                    required
                    type="number"
                    step="0.1"
                    placeholder="Расход 25мм"
                    value={newMix.consumption25mm}
                    onChange={(e) => setNewMix((p) => ({ ...p, consumption25mm: e.target.value }))}
                    className="input"
                  />
                  <input
                    type="number"
                    step="1"
                    placeholder="Цена за мешок, ₽"
                    value={newMix.pricePerBag}
                    onChange={(e) => setNewMix((p) => ({ ...p, pricePerBag: e.target.value }))}
                    className="input"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-tap mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light"
                >
                  Сохранить смесь
                </button>
              </form>
            )}

            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-tap rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-brand-dark hover:bg-accent-light disabled:opacity-60"
              >
                {saving ? "Сохраняем…" : "Сохранить параметры"}
              </button>
              {saved && <span className="text-sm text-success">Сохранено ✓</span>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <ReadField label="Площадь стен" value={room.wallArea ? `${room.wallArea} м²` : "—"} />
            <ReadField label="Площадь пола" value={room.floorArea ? `${room.floorArea} м²` : "—"} />
            <ReadField label="Площадь окон" value={room.windowArea ? `${room.windowArea} м²` : "—"} />
          </div>
        )}
      </section>

      {/* Калькулятор — только для бригадира/админа */}
      {canEdit && (
        <section className="card mb-6 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Расчёт материалов</h2>
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="btn-tap flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-60"
            >
              {calculating ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />}
              Рассчитать
            </button>
          </div>

          {calcError && <p className="text-sm text-danger">{calcError}</p>}

          {calcResult && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-400 dark:border-white/10">
                    <th className="py-2 font-medium">Материал</th>
                    <th className="py-2 font-medium">Кол-во</th>
                    <th className="py-2 font-medium">Цена/ед.</th>
                    <th className="py-2 font-medium">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {calcResult.lineItems.map((item) => (
                    <tr key={item.key} className="border-b border-gray-50 last:border-0 dark:border-white/5">
                      <td className="py-2">{item.description}</td>
                      <td className="py-2">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2">{item.unitPrice ? `${item.unitPrice} ₽` : "—"}</td>
                      <td className="py-2 font-medium">{item.total ? `${item.total.toLocaleString("ru-RU")} ₽` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex justify-end">
                <p className="text-base font-bold">
                  Итого: {calcResult.totalCost.toLocaleString("ru-RU")} ₽
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Последние отчёты по комнате */}
      {room.reports.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Последние отчёты</h2>
          <div className="flex flex-col gap-3">
            {room.reports.map((r) => (
              <div key={r.id} className="border-b border-gray-50 pb-3 text-sm last:border-0 dark:border-white/5">
                <div className="flex justify-between text-gray-400">
                  <span>{new Date(r.date).toLocaleDateString("ru-RU")}</span>
                  <span>{r.wallsArea + r.ceilingArea} м²</span>
                </div>
                {r.comment && <p className="mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background: transparent;
        }
        .dark .input {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .input:focus {
          border-color: #c99a44;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
