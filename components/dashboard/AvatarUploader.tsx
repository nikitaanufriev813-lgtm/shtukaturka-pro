"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";

export function AvatarUploader({
  currentAvatarUrl,
  name,
}: {
  currentAvatarUrl: string | null;
  name: string;
}) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append("avatar", file);
    const res = await fetch("/api/users/avatar", { method: "POST", body });
    setUploading(false);

    if (res.ok) {
      const data = await res.json();
      setAvatarUrl(data.avatarUrl);
    }
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <label className="btn-tap group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent/30 to-brand/20 text-2xl font-bold text-brand dark:text-accent">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
        {uploading ? <Loader2 size={20} className="animate-spin text-white" /> : <Camera size={20} className="text-white" />}
      </div>
      <input type="file" accept="image/*" hidden onChange={handleUpload} disabled={uploading} />
    </label>
  );
}
