import type { NextApiRequest, NextApiResponse } from "next";
import { getLeads } from "../../../lib/sheets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Simple auth: expect header "x-admin-password: <ADMIN_PASSWORD>"
  const pass = req.headers["x-admin-password"];
  if (!pass || pass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const leads = await getLeads();
    return res.status(200).json({ leads });
  } catch (e: any) {
    console.error("Admin getLeads error:", e?.message || e);
    return res.status(500).json({ error: "Failed to load leads" });
  }
}
