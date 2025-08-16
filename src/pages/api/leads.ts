import type { NextApiRequest, NextApiResponse } from 'next';
import { appendLeadRow } from '@/lib/sheets';

type LeadReq = {
  source?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // handle raw string or parsed JSON bodies
  const body: LeadReq = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // minimal validation
  if (!body?.name && !body?.email && !body?.phone) {
    return res.status(400).json({ error: 'Provide at least name or email or phone' });
  }

  const now = new Date().toISOString();

  try {
    await appendLeadRow([
      now,
      body.source || 'web',
      body.name || '',
      body.email || '',
      body.phone || '',
      body.address || '',
      body.city || '',
      body.state || '',
      body.zip || '',
      body.notes || '',
    ]);

    return res.status(201).json({ ok: true });
  } catch (e: any) {
    console.error('Sheets append error:', e?.message || e);
    return res.status(500).json({ error: 'Failed to save lead' });
  }
}
