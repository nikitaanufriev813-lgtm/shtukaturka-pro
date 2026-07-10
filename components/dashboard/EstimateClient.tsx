"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Save, History, Loader2 } from "lucide-react";

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  source: string;
}

interface Snapshot {
  id: string;
  totalCost: number;
  createdAt: string;
  breakdownJson: { description: string; quantity: number; unit: string; unitPrice: number; total: number }[];
}

export function EstimateClient({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingSnapshot, setViewingSnapshot] = useState<Snapshot | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  async function handleSync() {
    setSyncing(true);
    const res = await fetch(`/api/projects/${projectId}/estimate`, { method: "POST" });
    setSyncing(false);
    setLoading(false);
    if (res.ok) {
      setItems(await res.json());
    }
  }

  async function loadHistory() {
    const res = await fetch(`/api/projects/${projectId}/estimate-snapshots`);
    if (res.ok) setSnapshots(await res.json());
  }

  async function handleSaveSnapshot() {
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}/estimate-snapshots`, { method: "POST" });
    setSaving(false);
    if (res.ok) {
      await loadHistory();
    }
  }

  async function handlePriceEdit(id: string) {
    const price = parseFloat(editValue);
    if (isNaN(price) || price < 0) return;
    const res = await fetch(`/api/estimate-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitPrice: price }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    }
    setEditingId(null);
  }

  useEffect(() => {
    handleSync();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCost = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-tap flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-accent-light disabled:opacity-60"
        >
          {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Пересчитать по комнатам
        </button>
        <button
          onClick={handleSaveSnapshot}
          disabled={saving || items.length === 0}
          className="btn-tap flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20 disabled:opacity-60"
        >
          <Save size={16} />
          Сохранить в историю
        </button>
        <button
          onClick={() => {
            setShowHistory((v) => !v);
            if (!showHistory) loadHistory();
          }}
          className="btn-tap flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20"
        >
          <History size={16} />
          История ({snapshots.length})
        </button>
      </div>

      {showHistory && (
        <div className="mb-6 overflow-x-auto rounded-xl2 bg-[#182236] p-4">
          <p className="mb-3 text-sm font-medium text-gray-300">Сохранённые версии сметы</p>
          <div className="flex flex-col gap-2">
            {snapshots.map((s) => (
              <button
                key={s.id}
                onClick={() => setViewingSnapshot(viewingSnapshot?.id === s.id ? null : s)}
                className="btn-tap flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5 text-left text-sm hover:bg-white/10"
              >
                <span>{new Date(s.createdAt).toLocaleString("ru-RU")}</span>
                <span className="font-semibold text-accent">{s.totalCost.toLocaleString("ru-RU")} ₽</span>
              </button>
            ))}
            {snapshots.length === 0 && <p className="text-sm text-gray-500">История пуста</p>}
          </div>

          {viewingSnapshot && (
            <div className="mt-4 overflow-x-auto rounded-lg bg-black/20 p-3">
              <table className="w-full min-w-[480px] text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-left text-gray-400">
                    <th className="py-1.5">Материал</th>
                    <th className="py-1.5">Кол-во</th>
                    <th className="py-1.5">Цена</th>
                    <th className="py-1.5">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingSnapshot.breakdownJson.map((item, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="py-1.5">{item.description}</td>
                      <td className="py-1.5">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-1.5">{item.unitPrice} ₽</td>
                      <td className="py-1.5 font-medium">{item.total.toLocaleString("ru-RU")} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl2 bg-[#182236]">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-400">
              <th className="px-4 py-3 font-medium">Материал</th>
              <th className="px-4 py-3 font-medium">Кол-во</th>
              <th className="px-4 py-3 font-medium">Цена/ед.</th>
              <th className="px-4 py-3 font-medium">Итого</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      autoFocus
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handlePriceEdit(item.id)}
                      onKeyDown={(e) => e.key === "Enter" && handlePriceEdit(item.id)}
                      className="w-24 rounded border border-white/20 bg-transparent px-2 py-1 text-sm outline-none focus:border-accent"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(item.unitPrice.toString());
                      }}
                      className="btn-tap rounded px-2 py-1 text-left hover:bg-white/5"
                    >
                      {item.unitPrice.toLocaleString("ru-RU")} ₽ ✎
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{item.total.toLocaleString("ru-RU")} ₽</td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Пока нет данных — заполните параметры комнат и нажмите "Пересчитать по комнатам"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <p className="text-xl font-bold">
          Итого по объекту: <span className="text-accent">{totalCost.toLocaleString("ru-RU")} ₽</span>
        </p>
      </div>
    </div>
  );
}
