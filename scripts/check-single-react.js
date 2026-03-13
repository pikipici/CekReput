#!/usr/bin/env node

const { execSync } = require('child_process');

function collectVersions(tree, depName, out = new Set()) {
  if (!tree || typeof tree !== 'object') return out;
  const deps = tree.dependencies || {};
  for (const [name, node] of Object.entries(deps)) {
    if (name === depName && node && node.version) {
      out.add(node.version);
    }
    collectVersions(node, depName, out);
  }
  return out;
}

function main() {
  const raw = execSync('npm ls react react-dom --all --json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const tree = JSON.parse(raw);

  const reactVersions = Array.from(collectVersions(tree, 'react'));
  const reactDomVersions = Array.from(collectVersions(tree, 'react-dom'));

  const problems = tree.problems || [];

  const ok = reactVersions.length <= 1 && reactDomVersions.length <= 1 && problems.length === 0;

  if (!ok) {
    console.error('❌ React runtime mismatch detected');
    console.error('react versions:', reactVersions);
    console.error('react-dom versions:', reactDomVersions);
    if (problems.length > 0) {
      console.error('npm problems:', problems);
    }
    process.exit(1);
  }

  console.log('✅ Single React runtime OK');
  console.log('react:', reactVersions[0] || '(not found)');
  console.log('react-dom:', reactDomVersions[0] || '(not found)');
}

main();
