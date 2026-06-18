"use client";

import { FlaskConical, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearSession } from "@/lib/auth";
import {
  getRealm,
  realmDescription,
  realmLabel,
  setRealm,
  type AppRealm,
} from "@/lib/realm";

export function RealmToggle() {
  const router = useRouter();
  const [realm, setLocalRealm] = useState<AppRealm>(() => getRealm());
  const [switching, setSwitching] = useState(false);

  function switchTo(next: AppRealm) {
    if (next === realm || switching) return;
    setSwitching(true);
    setRealm(next);
    setLocalRealm(next);
    clearSession();
    router.push("/login");
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--li-border)] bg-[#faf9f7] p-0.5">
      {(["live", "volume"] as const).map((id) => {
        const active = realm === id;
        const Icon = id === "live" ? Sparkles : FlaskConical;
        return (
          <button
            key={id}
            type="button"
            title={realmDescription(id)}
            disabled={switching}
            onClick={() => switchTo(id)}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
              active
                ? "bg-white text-[var(--li-blue)] shadow-sm"
                : "text-[var(--li-muted)] hover:text-[var(--li-text)]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {realmLabel(id)}
          </button>
        );
      })}
    </div>
  );
}
