#!/usr/bin/env node
/**
 * Fix consultations where payment_status=confirmed but status=pending
 */

require("dotenv").config();
const { Client } = require("pg");

async function fixConsultationStatus() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    const result = await client.query(`
      UPDATE consultations
      SET status = 'confirmed'
      WHERE payment_status = 'confirmed'
        AND status = 'pending'
      RETURNING id, client_name
    `);

    console.log(`\n✅ Updated ${result.rowCount} consultations:`);
    result.rows.forEach((row) => {
      console.log(`   - ${row.id}: ${row.client_name}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

fixConsultationStatus();
