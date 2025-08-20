import { useEffect, useMemo, useState } from "react";

type Lead = { [key: string]: string };

export default function AdminPage() {
  const [password, setPassword] = useState<string>("");
  const [authed, setAuthed] = useState<boolean>(false);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("adminPass");
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  async function loadLeads(pass: string) {
    setError(null);
    setLeads(null);
    try {
      const res = await fetch("/api/admin/leads", {
        headers: { "x-admin-password": pass },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to fetch");
      }
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load leads");
    }
  }

  function onLogin(e: React.FormEvent) {
    e.preventDefault();
    window.localStorage.setItem("adminPass", password);
    setAuthed(true);
    loadLeads(password);
  }

  function onLogout() {
    window.localStorage.removeItem("adminPass");
    setPassword("");
    setAuthed(false);
    setLeads(null);
  }

  const csvHref = useMemo(() => {
    if (!leads || leads.length === 0) return "";
    const headers = Object.keys(leads[0]);
    const lines = [
      headers.join(","),
      ...leads.map((row) =>
        headers.map((h) => JSON.stringify((row[h] || "").replace(/\r?\n/g, " "))).join(",")
      ),
    ];
    const csv = lines.join("\n");
    return "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  }, [leads]);

  return (
    <main style={{ maxWidth: 960, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Admin — Leads</h1>

      {!authed ? (
        <form onSubmit={onLogin} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}
          />
          <button type="submit" style={{ padding: 10, borderRadius: 8, background: "#111", color: "#fff", border: "none" }}>
            Enter
          </button>
          {error && <p style={{ color: "crimson" }}>{error}</p>}
        </form>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <button onClick={() => loadLeads(password)} style={{ padding: 8, borderRadius: 6 }}>
              Refresh
            </button>
            <a
              href={csvHref || "#"}
              download="leads.csv"
              style={{ padding: 8, borderRadius: 6, pointerEvents: csvHref ? "auto" : "none", color: csvHref ? "#06c" : "#888" }}
            >
              Download CSV
            </a>
            <button onClick={onLogout} style={{ padding: 8, borderRadius: 6 }}>
              Logout
            </button>
          </div>

          {error && <p style={{ color: "crimson" }}>{error}</p>}

          {!leads ? (
            <p>Click “Refresh” to load leads.</p>
          ) : leads.length === 0 ? (
            <p>No leads yet.</p>
          ) : (
            <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 8 }}>
              <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead style={{ background: "#f6f6f6" }}>
                  <tr>
                    {Object.keys(leads[0]).map((h) => (
                      <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((row, i) => (
                    <tr key={i}>
                      {Object.keys(leads[0]).map((h) => (
                        <td key={h} style={{ borderBottom: "1px solid #f2f2f2", fontSize: 14 }}>{row[h] || ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
