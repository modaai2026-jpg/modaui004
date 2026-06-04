const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const serverFile = path.join(rootDir, 'server.ts');
const appFile = path.join(srcDir, 'App.tsx');
const apiFile = path.join(srcDir, 'services', 'api.ts');
const dbFile = path.join(srcDir, 'server', 'db.ts');
const dataFile = path.join(rootDir, 'data', 'modadb.json');

function readFile(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf-8');
}

function walk(dir, extensions) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walk(filePath, extensions));
    } else if (extensions.includes(path.extname(entry.name))) {
      result.push(filePath);
    }
  }
  return result;
}

function buildStepMap() {
  const source = readFile(appFile);
  const stepMap = new Map();
  const mapMatch = source.match(/const\s+stepUrlMap[\s\S]*?=\s*{([\s\S]*?)}/);
  if (mapMatch) {
    const mapBody = mapMatch[1];
    const entryRe = /([A-Z0-9_]+)\s*:\s*['\"]([^'\"]+)['\"]/g;
    let match;
    while ((match = entryRe.exec(mapBody))) {
      stepMap.set(match[1], match[2]);
    }
  }
  return [...stepMap.entries()].map(([step, pathValue]) => ({ step, path: pathValue }));
}

function collectMenuActions() {
  const files = walk(srcDir, ['.tsx', '.ts']);
  const actions = new Set();
  const hashes = new Set();
  files.forEach(file => {
    const content = readFile(file);
    const stepRegex = /step\s*:\s*['\"]([A-Z0-9_]+)['\"]/g;
    let match;
    while ((match = stepRegex.exec(content))) {
      actions.add(match[1]);
    }
    const hashRegex = /window\.location\.hash\s*=\s*['\"]([^'\"]+)['\"]/g;
    while ((match = hashRegex.exec(content))) {
      hashes.add(match[1]);
    }
  });
  return { actions: [...actions], hashes: [...hashes] };
}

function collectApiEndpoints() {
  const content = readFile(serverFile);
  const re = /app\.(get|post|put|delete|patch)\(\s*['\"]([^'\"]+)['\"]/g;
  const endpoints = [];
  let match;
  while ((match = re.exec(content))) {
    endpoints.push({ method: match[1].toUpperCase(), path: match[2] });
  }
  return endpoints;
}

function collectServiceFetches() {
  const files = walk(srcDir, ['.ts', '.tsx', '.js', '.jsx']);
  const paths = new Set();
  const re = /fetch\(\s*['\"]([^'\"]+)['\"]/g;
  files.forEach(file => {
    const content = readFile(file);
    let match;
    while ((match = re.exec(content))) {
      paths.add(match[1]);
    }
  });
  return [...paths];
}

function collectDatabaseTables() {
  const content = readFile(dbFile);
  const schemaMatch = content.match(/export interface DatabaseSchema \{([\s\S]*?)\}/);
  if (!schemaMatch) return [];
  const schemaBody = schemaMatch[1];
  const tableRe = /^(\s*)([a-zA-Z0-9_]+)\s*:\s*[^;]+;/gm;
  const tables = [];
  let match;
  while ((match = tableRe.exec(schemaBody))) {
    tables.push(match[2]);
  }
  return tables;
}

function collectTableUsage(tables) {
  const files = walk(srcDir, ['.ts', '.tsx']);
  const usage = {};
  tables.forEach(table => { usage[table] = false; });
  const filesContent = files.map(file => ({ file, content: readFile(file) }));
  for (const { file, content } of filesContent) {
    for (const table of tables) {
      if (!usage[table] && content.includes(`db.${table}`)) {
        usage[table] = true;
      }
    }
  }
  return usage;
}

function collectRouteStringLinks() {
  const files = walk(srcDir, ['.tsx', '.ts']);
  const pattern = /href\s*=\s*['\"](#|\/[^'\"]*)['\"]/g;
  const links = new Set();
  for (const file of files) {
    const content = readFile(file);
    let match;
    while ((match = pattern.exec(content))) {
      links.add(match[1]);
    }
  }
  return [...links];
}

function collectFeatureDefinitions() {
  const files = walk(srcDir, ['.tsx', '.ts']);
  const features = new Set();
  files.forEach(file => {
    const content = readFile(file);
    const textRegex = /label\s*:\s*['\"]([^'\"]+)['\"]/g;
    let match;
    while ((match = textRegex.exec(content))) {
      features.add(match[1]);
    }
  });
  return [...features];
}

function collectStepActionsFromSource() {
  return collectMenuActions().actions;
}

function generateReport() {
  const pages = buildStepMap();
  const menus = collectMenuActions();
  const apiEndpoints = collectApiEndpoints();
  const servicePaths = collectServiceFetches();
  const tables = collectDatabaseTables();
  const tableUsage = collectTableUsage(tables);
  const links = collectRouteStringLinks();
  const features = collectFeatureDefinitions();

  const orphanPages = pages.filter(page => !menus.actions.includes(page.step) && page.step !== 'LANDING');
  const orphanApis = apiEndpoints.filter(endpoint => {
    return !servicePaths.some(path => path.startsWith(endpoint.path));
  });
  const orphanTables = tables.filter(table => !tableUsage[table]);

  const report = {
    timestamp: new Date().toISOString(),
    pageFeatures: pages,
    menuSteps: menus.actions,
    hashLinks: menus.hashes,
    routeLinks: links,
    apiEndpoints,
    servicePaths,
    databaseTables: tables,
    databaseTableUsage: tableUsage,
    orphanPages,
    orphanApis,
    orphanTables,
    featureCount: pages.length + apiEndpoints.length + tables.length,
    lostFeatureCount: orphanPages.length + orphanApis.length + orphanTables.length,
    recoveredFeatureCount: 0,
    truthScore: Number(((pages.length - orphanPages.length) / Math.max(1, pages.length) * 100).toFixed(2)),
    completenessScore: Number((100 - ((orphanPages.length + orphanApis.length + orphanTables.length) / Math.max(1, pages.length + apiEndpoints.length + tables.length) * 100)).toFixed(2))
  };

  const outputPath = path.join(rootDir, 'docs', 'audit', 'task-00b-completeness-report.json');
  const markdownPath = path.join(rootDir, 'docs', 'audit', 'task-00b-completeness-report.md');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  fs.writeFileSync(markdownPath, generateMarkdown(report), 'utf-8');
  return report;
}

function generateMarkdown(report) {
  const pageLines = report.orphanPages.map(p => `- \`${p.step}\` (\`${p.path}\`)`).join('\n');
  const apiLines = report.orphanApis.map(api => `- [${api.method}] ${api.path}`).join('\n');
  const tableLines = report.orphanTables.map(table => `- ${table}`).join('\n');
  return `# TASK 00B Completeness Audit Report

Date: ${report.timestamp}

## Summary

This audit evaluates the current codebase for hidden or orphaned functionality across:
- frontend pages/routes
- backend API endpoints
- database tables
- service integration paths

The audit is intentionally conservative: it treats a feature as "lost" when it exists in code but is not discoverable through the app's visible navigation, route maps, service wiring, or page menu.

## Metrics

- **Total feature count**: ${report.featureCount}
- **Lost feature count**: ${report.lostFeatureCount}
- **Recovered feature count**: ${report.recoveredFeatureCount}
- **Truth score**: ${report.truthScore}%
- **Completeness score**: ${report.completenessScore}%

## Findings

### Hidden / Orphaned Pages

${pageLines || '- None'}

### Hidden / Orphaned APIs

${apiLines || '- None'}

### Hidden / Orphaned Database Tables

${tableLines || '- None'}

## Immediate Recovery Recommendations

1. Restore visible entry points for hidden platform and admin features.
2. Reconcile orphan APIs with frontend service paths.
3. Reconcile orphan tables with UI/feature wiring.
4. Use the audit results as the first pass for a recovery sprint, not as a feature expansion plan.
`;
}
function printReport(report) {
  console.log('=== TASK 00B Completeness Audit ===');
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Feature Count: ${report.featureCount}`);
  console.log(`Lost Feature Count: ${report.lostFeatureCount}`);
  console.log(`Recovered Feature Count: ${report.recoveredFeatureCount}`);
  console.log(`Truth Score: ${report.truthScore}%`);
  console.log(`Completeness Score: ${report.completenessScore}%\n`);
  console.log(`Orphan Pages (${report.orphanPages.length}):`);
  report.orphanPages.forEach(p => console.log(`  - ${p.step} (${p.path})`));
  console.log(`\nOrphan APIs (${report.orphanApis.length}):`);
  report.orphanApis.forEach(api => console.log(`  - [${api.method}] ${api.path}`));
  console.log(`\nOrphan Tables (${report.orphanTables.length}):`);
  report.orphanTables.forEach(table => console.log(`  - ${table}`));
  console.log(`\nReport JSON saved to docs/audit/task-00b-completeness-report.json`);
}

const report = generateReport();
printReport(report);
