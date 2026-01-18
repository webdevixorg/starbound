#!/usr/bin/env node

/**
 * Deploy script that runs after Next.js build
 * This automatically syncs your frontend to the VPS after building
 *
 * Usage in package.json: "build": "next build && node deploy-after-build.js"
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const VPS_USER = 'webdevix';
const VPS_IP = '195.35.22.10';
const VPS_PATH = '/var/www/starbound/';
const ROOT_DIR = path.join(__dirname, '..');
const EXCLUDE_FILE = path.join(ROOT_DIR, 'rsync-exclude.txt');
const SSH_OPTS = '-o StrictHostKeyChecking=accept-new';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(message) {
  log(`\n${message}`, 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'yellow');
}

// Check if rsync is available
function checkRsync() {
  return new Promise((resolve) => {
    exec('rsync --version', (error) => {
      resolve(!error);
    });
  });
}

// Execute rsync
function syncToVps() {
  return new Promise((resolve) => {
    logStep('Syncing frontend to VPS...');

    const rsyncCmd = `rsync -avz --delete --exclude-from="${EXCLUDE_FILE}" \\
      -e "ssh ${SSH_OPTS}" \\
      --exclude=.git \\
      --exclude=.env.local \\
      --exclude=.env \\
      --exclude=__pycache__ \\
      --exclude=.pytest_cache \\
      --exclude=.venv \\
      --exclude=venv \\
      "${ROOT_DIR}/" "${VPS_USER}@${VPS_IP}:${VPS_PATH}"`;

    exec(rsyncCmd, { shell: '/bin/bash' }, (error, stdout, stderr) => {
      if (error) {
        logError(`Deployment failed: ${error.message}`);
        if (stderr) {
          console.error(stderr);
        }
        resolve(false);
      } else {
        logSuccess('Frontend synced successfully to VPS');
        if (stdout) {
          console.log(stdout);
        }
        resolve(true);
      }
    });
  });
}

// Main execution
(async () => {
  log('=== Frontend Deployment Script ===', 'blue');

  const hasRsync = await checkRsync();
  if (!hasRsync) {
    logError('rsync not found. Please ensure rsync is installed.');
    logError('On Windows, use WSL, Git Bash, or Cygwin.');
    process.exit(1);
  }

  const success = await syncToVps();

  if (success) {
    logSuccess('Deployment complete!');
    process.exit(0);
  } else {
    logError('Deployment failed');
    process.exit(1);
  }
})();
