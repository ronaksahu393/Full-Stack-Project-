#!/usr/bin/env node
/**
 * HotelPro Clean Source Packaging Script
 * 
 * Generates a clean source archive excluding:
 *  - node_modules (root, server, client)
 *  - build and distribution output (dist, build, .vite)
 *  - secrets and local environment files (.env, .env.* except .env.example)
 *  - certificates and keys (*.pem, *.key, *.cert)
 *  - coverage and test output (coverage, .nyc_output)
 *  - logs (*.log), caches (.cache), OS metadata (.DS_Store, Thumbs.db)
 *  - temporary files (*.tmp, *.temp) and existing archive files (*.zip, *.tar.gz)
 * 
 * Preserves:
 *  - All source code, controllers, routes, models, views, components
 *  - Package manifests and lockfiles (root, server, client)
 *  - Environment examples (.env.example, server/.env.example)
 *  - Database seeds, migrations, and test suites
 *  - Documentation (README.md), licenses, and .gitignore rules
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

// Directory names to exclude everywhere
const EXCLUDED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.vite',
  '.cache',
  'coverage',
  '.nyc_output',
  '.git',
  '.idea',
  '.vscode'
]);

// File extensions and patterns to exclude
const EXCLUDED_EXTENSIONS = new Set([
  '.log',
  '.tmp',
  '.temp',
  '.suo',
  '.sln',
  '.zip',
  '.tar',
  '.gz',
  '.tgz',
  '.rar',
  '.7z',
  '.pem',
  '.key',
  '.cert',
  '.crt',
  '.pfx',
  '.p12'
]);

const EXCLUDED_FILENAMES = new Set([
  '.ds_store',
  'thumbs.db'
]);

/**
 * Determines whether a file or directory should be ignored.
 */
function shouldIgnore(relPath, isDirectory) {
  const normalized = relPath.replace(/\\/g, '/');
  const parts = normalized.split('/');
  const baseName = parts[parts.length - 1];
  const lowerBaseName = baseName.toLowerCase();

  // Check directory exclusion
  if (isDirectory) {
    if (EXCLUDED_DIRS.has(baseName) || EXCLUDED_DIRS.has(lowerBaseName)) {
      return true;
    }
  }

  // Check if any ancestor is an excluded directory
  for (let i = 0; i < parts.length - (isDirectory ? 1 : 0); i++) {
    if (EXCLUDED_DIRS.has(parts[i]) || EXCLUDED_DIRS.has(parts[i].toLowerCase())) {
      return true;
    }
  }

  if (isDirectory) {
    return false;
  }

  // Preserve .env.example
  if (lowerBaseName === '.env.example' || lowerBaseName.endsWith('.env.example')) {
    return false;
  }

  // Exclude real .env and environment files
  if (lowerBaseName === '.env' || lowerBaseName.startsWith('.env.')) {
    return true;
  }

  // Exclude sensitive and temporary file types
  if (EXCLUDED_FILENAMES.has(lowerBaseName)) {
    return true;
  }

  const ext = path.extname(lowerBaseName);
  if (EXCLUDED_EXTENSIONS.has(ext)) {
    return true;
  }

  // Multi-part extensions (.tar.gz)
  if (lowerBaseName.endsWith('.tar.gz')) {
    return true;
  }

  return false;
}

/**
 * Recursively collects eligible source files.
 */
function collectSourceFiles(dir, baseDir = dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (shouldIgnore(relPath, true)) {
        continue;
      }
      results.push(...collectSourceFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      if (!shouldIgnore(relPath, false)) {
        results.push({ fullPath, relPath });
      }
    }
  }

  return results;
}

/**
 * Validates that all critical components are included in the packaged file list.
 */
function validateFileList(files) {
  const relPaths = new Set(files.map(f => f.relPath.replace(/\\/g, '/')));

  const criticalRequirements = [
    'package.json',
    'package-lock.json',
    'README.md',
    '.gitignore',
    '.env.example',
    'server/package.json',
    'server/package-lock.json',
    'server/server.js',
    'server/.env.example',
    'client/package.json',
    'client/package-lock.json',
    'client/index.html',
    'client/vite.config.js',
    'client/src/App.jsx'
  ];

  const missing = criticalRequirements.filter(req => !relPaths.has(req));
  if (missing.length > 0) {
    throw new Error(`Integrity check failed: missing critical source file(s): ${missing.join(', ')}`);
  }

  // Verify no forbidden files are present
  const forbiddenLeaks = files.filter(f => {
    const p = f.relPath.replace(/\\/g, '/');
    const b = path.basename(p).toLowerCase();
    return (
      p.includes('node_modules/') ||
      p.startsWith('node_modules/') ||
      p.includes('client/dist/') ||
      p.includes('server/dist/') ||
      p.includes('frontend/dist/') ||
      p.includes('backend/dist/') ||
      (b === '.env' || (b.startsWith('.env.') && !b.endsWith('.env.example')))
    );
  });

  if (forbiddenLeaks.length > 0) {
    throw new Error(`Integrity check failed: forbidden files detected in package set:\n${forbiddenLeaks.map(f => f.relPath).join('\n')}`);
  }

  return true;
}

/**
 * Main packaging routine.
 */
function packageSource() {
  const args = process.argv.slice(2);
  let outputArchive = path.join(ROOT_DIR, 'hotelpro-source.zip');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' || args[i] === '-o') {
      outputArchive = path.resolve(process.cwd(), args[++i]);
    } else if (!args[i].startsWith('-')) {
      outputArchive = path.resolve(process.cwd(), args[i]);
    }
  }

  console.log('================================================================================');
  console.log('  HOTELPRO SOURCE PACKAGING UTILITY                                             ');
  console.log('================================================================================');
  console.log(`✦ Source Root:      ${ROOT_DIR}`);
  console.log(`✦ Destination:      ${outputArchive}`);

  // 1. Collect files
  const files = collectSourceFiles(ROOT_DIR);
  console.log(`✦ Source Files:     ${files.length} clean files identified`);

  // 2. Validate
  validateFileList(files);
  console.log('✓ Source integrity and exclusion checks passed successfully.');

  // 3. Stage files in temporary directory
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hotelpro-pkg-'));
  const stageDir = path.join(tempDir, 'hotelpro');
  fs.mkdirSync(stageDir, { recursive: true });

  try {
    for (const file of files) {
      const destPath = path.join(stageDir, file.relPath);
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(file.fullPath, destPath);
    }

    // 4. Create Archive
    if (fs.existsSync(outputArchive)) {
      fs.unlinkSync(outputArchive);
    }

    let archived = false;

    // Strategy A: bsdtar / tar
    try {
      if (outputArchive.endsWith('.zip')) {
        execSync(`tar -a -cf "${outputArchive}" -C "${stageDir}" .`, { stdio: 'ignore' });
      } else {
        execSync(`tar -czf "${outputArchive}" -C "${stageDir}" .`, { stdio: 'ignore' });
      }
      archived = fs.existsSync(outputArchive) && fs.statSync(outputArchive).size > 0;
    } catch {
      archived = false;
    }

    // Strategy B: PowerShell Compress-Archive (Windows fallback)
    if (!archived && process.platform === 'win32') {
      try {
        const psCommand = `Compress-Archive -Path "${stageDir}\\*" -DestinationPath "${outputArchive}" -Force`;
        execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'ignore' });
        archived = fs.existsSync(outputArchive) && fs.statSync(outputArchive).size > 0;
      } catch {
        archived = false;
      }
    }

    if (!archived) {
      throw new Error(`Failed to create archive at ${outputArchive}. Please ensure tar or PowerShell is available.`);
    }

    const archiveStats = fs.statSync(outputArchive);
    const sizeKb = (archiveStats.size / 1024).toFixed(2);
    const sizeMb = (archiveStats.size / (1024 * 1024)).toFixed(2);

    console.log('--------------------------------------------------------------------------------');
    console.log(`✅ Clean Source Archive Created Successfully:`);
    console.log(`   File: ${outputArchive}`);
    console.log(`   Size: ${archiveStats.size > 1048576 ? `${sizeMb} MB` : `${sizeKb} KB`} (${archiveStats.size} bytes)`);
    console.log('--------------------------------------------------------------------------------');
    console.log('Excluded from Archive:');
    console.log('  • Dependencies:       node_modules/ (root, server, client)');
    console.log('  • Build Output:       dist/, client/dist/, build/, .vite/');
    console.log('  • Secrets & Env:      .env, .env.*, server/.env (kept: .env.example)');
    console.log('  • Credentials/Keys:   *.pem, *.key, *.cert, *.crt, *.pfx, *.p12');
    console.log('  • Runtime & Logs:     *.log, npm-debug.log*, yarn-error.log*');
    console.log('  • Test & Coverage:    coverage/, .nyc_output/');
    console.log('  • Caches & Temp:      .cache/, *.tmp, *.temp');
    console.log('  • Existing Archives:  *.zip, *.tar.gz, *.tgz, *.rar, *.7z');
    console.log('  • System / IDE:       .git/, .DS_Store, Thumbs.db, .idea/, .vscode/');
    console.log('--------------------------------------------------------------------------------');
    console.log('Re-installation & Run Instructions from Extracted Archive:');
    console.log('  1. Extract archive:   tar -xf hotelpro-source.zip');
    console.log('  2. Install deps:      npm run install:all');
    console.log('  3. Configure env:     Copy-Item server\\.env.example server\\.env');
    console.log('  4. Run application:   npm run dev');
    console.log('================================================================================');

  } finally {
    // Clean up temporary staging directory safely
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // non-fatal
    }
  }
}

if (require.main === module) {
  try {
    packageSource();
  } catch (err) {
    console.error(`❌ Packaging Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { packageSource, collectSourceFiles, shouldIgnore, validateFileList };
