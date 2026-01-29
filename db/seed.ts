
/*
  Run this script with: 
  npx tsx db/seed.ts
  
  Prerequisites:
  - DATABASE_URL environment variable set
  - "pg" and "dotenv" installed
*/

import { Client } from 'pg';
import { PROTOCOLS_DATA } from '../data/protocols';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function seedProtocols() {
  try {
    await client.connect();
    console.log("🔌 Connected to Database");

    for (const p of PROTOCOLS_DATA) {
      console.log(`Processing: ${p.title}`);

      // 1. Insert Protocol
      const protocolRes = await client.query(`
        INSERT INTO protocols 
        (slug, title, description, mechanism, evidence_level, default_duration_days, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (slug) DO UPDATE SET 
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          tags = EXCLUDED.tags,
          mechanism = EXCLUDED.mechanism,
          evidence_level = EXCLUDED.evidence_level,
          default_duration_days = EXCLUDED.default_duration_days
        RETURNING id
      `, [p.id, p.title, p.description, p.mechanism, p.evidenceLevel, p.durationDays, p.tags]);

      const protocolId = protocolRes.rows[0].id;

      // 2. Insert Steps
      // First delete existing steps to ensure clean state on update
      await client.query('DELETE FROM protocol_steps WHERE protocol_id = $1', [protocolId]);

      for (const s of p.steps) {
        await client.query(`
          INSERT INTO protocol_steps (protocol_id, step_order, instruction, is_optional)
          VALUES ($1, $2, $3, $4)
        `, [protocolId, s.order, `${s.title}: ${s.description}`, !s.isMandatory]);
      }
    }

    console.log(`✅ Seeding Complete. ${PROTOCOLS_DATA.length} Protocols inserted/updated.`);

  } catch (err) {
    console.error("❌ Seeding Error:", err);
  } finally {
    await client.end();
  }
}

seedProtocols();
