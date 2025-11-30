#!/usr/bin/env node
/**
 * Vercel Helper Script
 * Manage Vercel deployments and environment variables via API
 *
 * Usage:
 *   node scripts/vercel-helper.mjs env:list
 *   node scripts/vercel-helper.mjs env:add KEY VALUE
 *   node scripts/vercel-helper.mjs deploy
 *   node scripts/vercel-helper.mjs deployments
 */

import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const ORG_ID = process.env.VERCEL_ORG_ID;

if (!VERCEL_TOKEN) {
  console.error("❌ VERCEL_TOKEN not found in .env");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${VERCEL_TOKEN}`,
  "Content-Type": "application/json",
};

async function listEnvVars() {
  const res = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/env`, { headers });
  const data = await res.json();

  console.log("\n📋 Environment Variables:\n");
  console.log("| Key | Target | Created |");
  console.log("|-----|--------|---------|");

  for (const env of data.envs || []) {
    const targets = env.target?.join(", ") || "all";
    const created = new Date(env.createdAt).toLocaleDateString();
    console.log(`| ${env.key} | ${targets} | ${created} |`);
  }
}

async function addEnvVar(key, value, targets = ["production", "preview", "development"]) {
  const body = JSON.stringify({
    key,
    value,
    type: "encrypted",
    target: targets,
  });

  const res = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env`, {
    method: "POST",
    headers,
    body,
  });

  if (res.ok) {
    console.log(`✅ Added ${key} to Vercel`);
  } else {
    const error = await res.json();
    console.error(`❌ Failed to add ${key}:`, error.error?.message);
  }
}

async function deleteEnvVar(key) {
  // First get the env ID
  const listRes = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/env`, { headers });
  const data = await listRes.json();

  const envVar = data.envs?.find((e) => e.key === key);
  if (!envVar) {
    console.error(`❌ ${key} not found`);
    return;
  }

  const res = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${envVar.id}`, {
    method: "DELETE",
    headers,
  });

  if (res.ok) {
    console.log(`✅ Deleted ${key}`);
  } else {
    console.error(`❌ Failed to delete ${key}`);
  }
}

async function listDeployments() {
  const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}&limit=5`, {
    headers,
  });
  const data = await res.json();

  console.log("\n🚀 Recent Deployments:\n");
  console.log("| URL | State | Created |");
  console.log("|-----|-------|---------|");

  for (const dep of data.deployments || []) {
    const created = new Date(dep.created).toLocaleString();
    console.log(`| ${dep.url} | ${dep.state} | ${created} |`);
  }
}

async function triggerDeploy() {
  // Get latest deployment to redeploy
  const listRes = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}&limit=1`,
    { headers }
  );
  const data = await listRes.json();

  if (!data.deployments?.[0]) {
    console.error("❌ No deployments found to redeploy");
    return;
  }

  const latest = data.deployments[0];

  const res = await fetch(`https://api.vercel.com/v13/deployments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "long-sang-forge",
      deploymentId: latest.uid,
      target: "production",
    }),
  });

  if (res.ok) {
    const result = await res.json();
    console.log(`✅ Deployment triggered!`);
    console.log(`📎 URL: https://${result.url}`);
  } else {
    const error = await res.json();
    console.error("❌ Deploy failed:", error.error?.message);
  }
}

async function getProjects() {
  const res = await fetch("https://api.vercel.com/v9/projects", { headers });
  const data = await res.json();

  console.log("\n📁 Your Projects:\n");
  console.log("| ID | Name | Framework |");
  console.log("|----|------|-----------|");

  for (const proj of data.projects || []) {
    console.log(`| ${proj.id} | ${proj.name} | ${proj.framework || "N/A"} |`);
  }
}

// CLI
const [, , command, ...args] = process.argv;

switch (command) {
  case "env:list":
    await listEnvVars();
    break;
  case "env:add":
    if (args.length < 2) {
      console.log("Usage: env:add KEY VALUE");
    } else {
      await addEnvVar(args[0], args[1]);
    }
    break;
  case "env:delete":
    if (!args[0]) {
      console.log("Usage: env:delete KEY");
    } else {
      await deleteEnvVar(args[0]);
    }
    break;
  case "deployments":
    await listDeployments();
    break;
  case "deploy":
    await triggerDeploy();
    break;
  case "projects":
    await getProjects();
    break;
  default:
    console.log(`
🚀 Vercel Helper

Commands:
  env:list              List all environment variables
  env:add KEY VALUE     Add environment variable
  env:delete KEY        Delete environment variable
  deployments           List recent deployments
  deploy                Trigger new deployment
  projects              List all projects
`);
}
