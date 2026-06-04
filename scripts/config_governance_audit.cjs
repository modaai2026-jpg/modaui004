const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'data', 'modadb.json');
const envPath = path.join(rootDir, '.env');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Failed to parse JSON at ${filePath}:`, err.message);
    process.exit(2);
  }
}

function walk(dir, extensions) {
  const result = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, name.name);
    if (name.isDirectory()) {
      result.push(...walk(filePath, extensions));
    } else if (extensions.includes(path.extname(name.name))) {
      result.push(filePath);
    }
  }
  return result;
}

function flattenSettings(obj, prefix = 'platform') {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return [prefix];
  }
  return Object.keys(obj).flatMap((key) => flattenSettings(obj[key], `${prefix}.${key}`));
}

function findMatches(text, regex) {
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    matches.push(m[1]);
  }
  return [...new Set(matches)];
}

function loadSourceKeys() {
  const files = walk(path.join(rootDir, 'src'), ['.ts', '.tsx', '.js', '.jsx']);
  const keys = new Set();
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    findMatches(content, /process\.env\.([A-Z0-9_]+)/g).forEach((k) => keys.add(k));
    findMatches(content, /const\s+([A-Z0-9_]+)\s*=\s*['\"][^'\"]+['\"]/g).forEach((k) => keys.add(k));
  }
  return [...keys];
}

function report() {
  const db = readJson(dbPath);
  if (!db) {
    console.error('Database not found. Please ensure data/modadb.json exists.');
    process.exit(1);
  }

  const configRegistry = db.config_registry || [];
  const registryKeys = new Set(configRegistry.map((item) => item.key));
  const settingsKeys = new Set(flattenSettings(db.platformSettings || {}, 'platform'));

  const missingRegistry = [...settingsKeys].filter((key) => !registryKeys.has(key));
  const orphanRegistry = configRegistry.filter((item) => !settingsKeys.has(item.key));

  const coverage = settingsKeys.size > 0 ? Number(((registryKeys.size / settingsKeys.size) * 100).toFixed(2)) : 0;
  const sourceEnvKeys = fs.existsSync(envPath) ? findMatches(fs.readFileSync(envPath, 'utf-8'), /^(?:export\s+)?([A-Z0-9_]+)=/gm) : [];
  const sourceConstants = loadSourceKeys();
  const sourceHardcoded = sourceConstants.filter((key) => !sourceEnvKeys.includes(key));

  console.log('=== MODAUI Global Configuration Governance Audit ===\n');
  console.log(`Config registry entries: ${configRegistry.length}`);
  console.log(`Platform settings keys: ${settingsKeys.size}`);
  console.log(`Configuration coverage score: ${coverage}%\n`);

  if (missingRegistry.length > 0) {
    console.log('--- Missing Registry Entries For Platform Settings ---');
    missingRegistry.forEach((key) => console.log(`  - ${key}`));
    console.log('');
  }

  if (orphanRegistry.length > 0) {
    console.log('--- Orphan Config Registry Entries (no matching platform setting) ---');
    orphanRegistry.forEach((item) => console.log(`  - ${item.key} (${item.module})`));
    console.log('');
  }

  if (sourceEnvKeys.length > 0) {
    console.log('--- Environment Variables Detected in .env ---');
    sourceEnvKeys.forEach((key) => console.log(`  - ${key}`));
    console.log('');
  }

  if (sourceHardcoded.length > 0) {
    console.log('--- Hardcoded uppercase constants / env-like keys detected in source ---');
    sourceHardcoded.slice(0, 60).forEach((key) => console.log(`  - ${key}`));
    if (sourceHardcoded.length > 60) {
      console.log(`  ... ${sourceHardcoded.length - 60} more entries`);
    }
    console.log('');
  }

  const blocked = missingRegistry.length > 0 || orphanRegistry.length > 0 || coverage < 95;
  if (blocked) {
    console.log('BLOCKED: Configuration Governance Failure');
    if (missingRegistry.length > 0) {
      console.log('Reason: 功能存在但没有注册到配置中心');
    }
    if (orphanRegistry.length > 0) {
      console.log('Reason: 配置注册表中存在孤立条目');
    }
    if (coverage < 95) {
      console.log(`Reason: 配置覆盖率 ${coverage}% 低于 95%`);
    }
    process.exit(3);
  }

  console.log('PASS: Global Configuration Governance Audit succeeded.');
}

report();
