import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('Sending...');
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setStatus(res.ok ? 'Saved!' : 'Failed.');
  }

  return (
    <main style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Real Estate Leads</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
        <input name="name" placeholder="Name" />
        <input name="email" placeholder="Email" />
        <input name="phone" placeholder="Phone" />
        <input name="address" placeholder="Address" />
        <div style={{ display: 'flex', gap: 8 }}>
          <input name="city" placeholder="City" style={{ flex: 1 }} />
          <input name="state" placeholder="State" style={{ width: 80 }} />
          <input name="zip" placeholder="Zip" style={{ width: 120 }} />
        </div>
        <input name="source" placeholder="Source (web, ad, etc.)" />
        <textarea name="notes" placeholder="Notes" />
        <button type="submit">Submit Lead</button>
      </form>
      {status && <p>{status}</p>}
    </main>
  );
}
