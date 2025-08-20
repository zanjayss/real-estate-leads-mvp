export async function sendLeadEmail(lead: {
  source?: string; name?: string; email?: string; phone?: string;
  address?: string; city?: string; state?: string; zip?: string; notes?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY!;
  const to = process.env.NOTIFY_TO_EMAIL!;
  const from = process.env.FROM_EMAIL || "onboarding@resend.dev";

  const html = `
    <h2>New Lead</h2>
    <p><b>Source:</b> ${lead.source || "web"}</p>
    <p><b>Name:</b> ${lead.name || "-"}</p>
    <p><b>Email:</b> ${lead.email || "-"}</p>
    <p><b>Phone:</b> ${lead.phone || "-"}</p>
    <p><b>Address:</b> ${lead.address || "-"}, ${lead.city || ""} ${lead.state || ""} ${lead.zip || ""}</p>
    <p><b>Notes:</b> ${lead.notes || "-"}</p>
  `;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `New Lead: ${lead.name || lead.email || lead.phone || "Unknown"}`,
      html,
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Resend error: ${resp.status} ${t}`);
  }
}
