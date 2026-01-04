/**
 * Script cập nhật logo cho các dự án thiếu logo
 */
require("dotenv").config({ path: ".env" });
const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL\n");

    // Logo URLs - từ public/images/project card
    const logos = {
      vungtauland: "/images/project card/logovungtauland.png",
      sabohub: "/images/project card/logosabohub.png",
      ainewbievn: "/images/project card/logoainewbie.png",
      "sabo-arena": "/images/project card/logosabo.png",
    };

    for (const [slug, logo_url] of Object.entries(logos)) {
      const result = await client.query(
        `UPDATE project_showcase SET logo_url = $1 WHERE slug = $2 RETURNING name`,
        [logo_url, slug]
      );
      if (result.rows.length > 0) {
        console.log(`✅ ${result.rows[0].name}: Logo updated`);
      } else {
        console.log(`⚠️ ${slug}: Not found`);
      }
    }

    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

main();
