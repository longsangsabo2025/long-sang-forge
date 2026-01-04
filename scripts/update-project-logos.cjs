/**
 * Script to update project logos in database
 */
const https = require("https");

const SUPABASE_URL = "diexsbzqwsbpilsymnfb.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY";

const updates = [
  { id: "4e80856f-5bf6-49b5-af2a-4112ac29b502", name: "SaboHub", logo_url: "/images/sabo.jpg" },
  { id: "32b6cbf4-92d2-4903-94f7-b224abd0cbe7", name: "AINewbieVN", logo_url: "https://ainewbievn.com/favicon.ico" },
  { id: "1f3a934e-3062-4268-adcc-af8923d39f6c", name: "VungtauLand", logo_url: "https://vungtauland.vercel.app/favicon.ico" },
];

function patchProject(id, logo_url) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ logo_url });
    
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: `/rest/v1/project_showcase?id=eq.${id}`,
      method: "PATCH",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
        "Prefer": "return=representation"
      }
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log("🎨 Updating project logos...\n");

  for (const project of updates) {
    try {
      const result = await patchProject(project.id, project.logo_url);
      if (result.status === 200) {
        console.log(`✅ ${project.name}: Updated to ${project.logo_url}`);
      } else {
        console.log(`❌ ${project.name}: Failed (${result.status}) - ${result.body}`);
      }
    } catch (error) {
      console.log(`❌ ${project.name}: Error - ${error.message}`);
    }
  }

  console.log("\n✨ Done!");
}

main();
