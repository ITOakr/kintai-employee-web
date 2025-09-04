import { useEffect, useState } from "react";
import { login, tokyoDateString, getMyDailyMe, postMyTimeEntry, nowTokyoISO } from "./lib/api";

type Daily = Awaited<ReturnType<typeof getMyDailyMe>>;

function isoAt(hour: number, minute = 0) {
  // 今の“今日(東京)”の日付で、指定時刻のISOにする
  const today = new Date();
  const dt = new Date(today);
  // 現地（東京）の YYYY-MM-DD を使って日時作成（ズレ対策は簡易）
  const d = tokyoDateString(today).split("-");
  dt.setFullYear(+d[0], +d[1] - 1, +d[2]);
  dt.setHours(hour, minute, 0, 0);
  return dt.toISOString();
}

export default function App() {
  const [email, setEmail] = useState("employee@example.com");
  const [password, setPassword] = useState("employeepass");
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [daily, setDaily] = useState<Daily | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string>(() => tokyoDateString());

  const loggedIn = !!token;

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.token);
      setToken(res.token);
    } catch (e: any) {
      alert(e.message ?? "login failed");
    }
  }

  async function refresh() {
    if (!loggedIn) return;
    try {
      setLoading(true);
      const res = await getMyDailyMe(date);
      setDaily(res);
    } catch (e: any) {
      alert(e.message ?? "fetch failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); /* 初回 */ }, [loggedIn, date]);

  async function clock(kind: "clock_in" | "clock_out" | "break_start" | "break_end") {
    try {
      setLoading(true);
      // 実運用では現在時刻を使う。デモは見やすく 9:00/12:00/13:00/18:00 を押し分けてもOK
      const nowISO = nowTokyoISO();
      await postMyTimeEntry(kind, nowISO, "web");
      await refresh();
    } catch (e: any) {
      alert(e.message ?? "clock failed");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setDaily(null);
  }

  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 420, margin: "6rem auto", padding: 16 }}>
        <h1>ログイン</h1>
        <form onSubmit={doLogin}>
          <div>
            <label>メール</label><br/>
            <input value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>パスワード</label><br/>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button style={{ marginTop: 12 }} type="submit">ログイン</button>
        </form>
        <p style={{ marginTop: 12, fontSize: 12, opacity: .7 }}>
          デモ: demo@example.com / pass1234
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>勤怠（従業員）</h1>
        <button onClick={logout}>ログアウト</button>
      </header>

      <section style={{ marginTop: 16 }}>
        <label>対象日：</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button onClick={refresh} disabled={loading} style={{ marginLeft: 8 }}>更新</button>
      </section>

      <section style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>今日のサマリ</h3>
        {loading && <p>読み込み中…</p>}
        {daily && (
          <ul>
            <li>status: <b>{daily.status}</b></li>
            <li>start: {daily.actual.start ?? "-"}</li>
            <li>end: {daily.actual.end ?? "-"}</li>
            <li>work: {daily.totals.work} 分 / break: {daily.totals.break} 分</li>
          </ul>
        )}
      </section>

      <section style={{ marginTop: 16, display: "grid", gap: 8, gridTemplateColumns: "repeat(2, 1fr)" }}>
        <button onClick={() => clock("clock_in")} disabled={loading}>出勤</button>
        <button onClick={() => clock("clock_out")} disabled={loading}>退勤</button>
        <button onClick={() => clock("break_start")} disabled={loading}>休憩開始</button>
        <button onClick={() => clock("break_end")} disabled={loading}>休憩終了</button>
      </section>

      <p style={{ marginTop: 16, fontSize: 12, opacity: .7 }}>
        ※ ボタンは“現在時刻”で打刻します（デモ実装）
      </p>
    </div>
  );
}
