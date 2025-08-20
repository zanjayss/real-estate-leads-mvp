import { useEffect, useMemo, useState } from "react";

type Lead = { [key: string]: string };

export default function AdminPage() {
  const [password, setPassword] = useState<string>("");
  const [authed, setAuthed] = useState<boolean>(false);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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
    setQuery("");
  }

  const filtered = useMemo(() => {
    if (!leads) return null;
    if (!query.trim()) return leads;
    const q = query.toLowerCase();
    return leads.filter((row) =>
      Object.values(row).some((v) => (v || "").toLowerCase().includes(q))
    );
  }, [leads, query]);

  const csvHref = useMemo(() => {
    if (!filtered || filtered.length === 0) return "";
    const headers = Object.keys(filtered[0]);
    const lines = [
      headers.join(","),
      ...filtered.map((row) =>
        headers
          .map((h) => JSON.stringify((row[h] || "").replace(/\r?\n/g, " ")))
          .join(",")
      ),
    ];
    const csv = lines.join("\n");
    return "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  }, [filtered]);

  return (
    <main className="max-w-6xl mx-auto p-6 font-sans">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin — Leads</h1>
        {authed && (
          <button
            onClick={onLogout}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Logout
          </button>
        )}
      </header>

      {!authed ? (
        <form onSubmit={onLogin} className="max-w-sm grid gap-3">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-black text-white font-semibold hover:bg-black/90"
          >
            Enter
          </button>
          {error && <p className="text-red-600">{error}</p>}
        </form>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => loadLeads(password)}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Refresh
              </button>
              <a
                href={csvHref || "#"}
                download="leads.csv"
                className={`px-3 py-2 rounded-lg border ${
                  csvHref
                    ? "border-gray-300 text-blue-600 hover:bg-gray-50"
                    : "border-gray-200 text-gray-400 pointer-events-none"
                }`}
              >
                Download CSV
              </a>
            </div>

            <input
              placeholder="Search all fields…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 w-full md:w-72"
            />
          </div>

          {error && <p className="text-red-600 mb-3">{error}</p>}

          {!filtered ? (
            <p>Click “Refresh” to load leads.</p>
          ) : filtered.length === 0 ? (
            <p>No leads found.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    {Object.keys(filtered[0]).map((h) => (
                      <th key={h} className="px-3 py-2 border-b border-gray-200 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr key={i} className="odd:bg-white even:bg-gray-50">
                      {Object.keys(filtered[0]).map((h) => (
                        <td key={h} className="px-3 py-2 border-b border-gray-100">
                          {row[h] || ""}
                        </td>
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
