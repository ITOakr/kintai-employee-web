const BASE = import.meta.env.VITE_API_BASE_URL as string;

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email: string, password: string) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams({ email, password }),
  });
  if (!r.ok) throw new Error(`login failed: ${r.status}`);
  return r.json() as Promise<{ token: string; user: { id: number; email: string; name: string } }>;
}

// Asia/Tokyo の YYYY-MM-DD を安全に作る（UTCズレ防止）
export function tokyoDateString(date = new Date()) {
  const f = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });
  const parts = f.formatToParts(date).reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {} as any);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function nowTokyoISO() {
  // 「いま（東京）」の日時を +09:00 付きISOで返す
  const f = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const s = f.format(new Date()); // 例: "2025-09-03 09:12:34"
  return s.replace(" ", "T") + "+09:00"; // -> "2025-09-03T09:12:34+09:00"
}

export async function getMyDailyMe(date: string) {
  const url = new URL(`${BASE}/v1/attendance/me/daily`);
  url.searchParams.set("date", date);

    const headers: Record<string, string> = {};

    const token = localStorage.getItem("token");
        if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

  const r = await fetch(url.toString(), { headers: headers });
  if (!r.ok) throw new Error(`GET /v1/attendance/me/daily ${r.status}`);
  return r.json() as Promise<{
    date: string;
    actual: { start: string | null; end: string | null };
    totals: { work: number; break: number; overtime: number; night: number; holiday: number };
    status: "open" | "closed" | "not_started" | "inconsistent_data";
  }>;
}

type Kind = "clock_in" | "clock_out" | "break_start" | "break_end";

export async function postMyTimeEntry(kind: Kind, happenedAtISO: string, source = "web") {
    const headers: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    };

    const token = localStorage.getItem("token");
        if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
  const r = await fetch(`${BASE}/v1/timeclock/time_entries`, {
    method: "POST",
    headers: headers,
    // backend は token だけで user_id を補完してくれる
    body: new URLSearchParams({ kind, happened_at: happenedAtISO, source }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`POST /time_entries ${r.status} ${t}`);
  }
  return r.json();
}

export async function me() {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const r = await fetch(`${BASE}/auth/me`, { headers });
  if (!r.ok) throw new Error(`GET /auth/me ${r.status}`);
  return r.json() as Promise<{ id: number; email: string; name: string; role?: string }>;
}