import { useState } from 'react';

export default function LeadFormPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 🔧 capture the form element BEFORE any await
    const formEl = e.currentTarget;

    setStatus('Sending...');
    const form = new FormData(formEl);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus('Saved! Check your email.');
        formEl.reset(); // ✅ safe now
      } else {
        const t = await res.text();
        setStatus(`Failed: ${t}`);
      }
    } catch (err: any) {
      setStatus(`Error: ${err?.message || err}`);
    }
  }

  const field = (name: string, props: any = {}) => (
    <input
      name={name}
      placeholder={name[0].toUpperCase() + name.slice(1)}
      style={{ padding: 10, border: '1px solid #ccc', borderRadius: 6 }}
      {...props}
    />
  );

  return (
    <main style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 8 }}>Get a Cash Offer</h1>
      <p style={{ marginTop: 0, color: '#555' }}>
        Enter your details. We’ll email you and save to our system.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, marginTop: 16 }}>
        {field('name', { required: true })}
        {field('email', { type: 'email' })}
        {field('phone', { required: true })}
        {field('address')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 10 }}>
          {field('city')}
          {field('state')}
          {field('zip')}
        </div>
        {field('source', { defaultValue: 'web' })}
        <textarea
          name="notes"
          placeholder="Notes"
          style={{ padding: 10, border: '1px solid #ccc', borderRadius: 6, minHeight: 80 }}
        />
        <button
          type="submit"
          style={{ padding: 12, borderRadius: 8, border: 'none', background: '#111', color: 'white', fontWeight: 600 }}
        >
          Submit
        </button>
      </form>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </main>
  );
}
