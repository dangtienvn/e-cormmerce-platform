const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const startDate = new Date('2026-01-02T08:00:00Z');
const endDate = new Date('2026-07-20T17:00:00Z');
const rootDir = path.resolve(__dirname, '..');

const holidays = [
  '2026-01-01',
  '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22',
  '2026-04-27',
  '2026-04-30',
  '2026-05-01',
];

const excludeDirs = ['.git', 'node_modules', '.next', 'dist', 'logs', '.env', '.turbo'];

// Get all files recursively
function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        getFiles(fullPath, files);
      }
    } else {
      // Exclude binary files or lock files if desired, but lock files are okay to commit.
      // We will commit everything found.
      files.push(fullPath);
    }
  }
  return files;
}

function isWorkingDay(date) {
  const day = date.getDay();
  if (day === 0) return false;
  const dateString = date.toISOString().split('T')[0];
  if (holidays.includes(dateString)) return false;
  return true;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCommitMessage(filePath) {
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const basename = path.basename(filePath);
  
  let module = 'core';
  if (relativePath.includes('backend-core')) module = 'backend';
  else if (relativePath.includes('crm-system')) module = 'crm';
  else if (relativePath.includes('digital-store')) module = 'store';
  else if (relativePath.includes('blog-cms')) module = 'blog';

  const ext = path.extname(basename);
  let type = 'feat';
  if (ext === '.css' || ext === '.scss') type = 'style';
  else if (basename.includes('config') || basename === 'package.json') type = 'chore';
  else if (basename.includes('route') || basename.includes('controller')) type = 'feat';
  else if (basename.includes('test')) type = 'test';
  
  // The first letter of commit message must NOT be capitalized according to the user rule
  return `${type}(${module}): implement ${basename}`;
}

const allFiles = getFiles(rootDir);
// Sort files to make commits logical (e.g., config first, backend first, frontend later)
// A simple sort by path works decently well
allFiles.sort();

console.log(`Found ${allFiles.length} files to commit.`);

// Generate valid dates
const validDates = [];
let currentDate = new Date(startDate);
while (currentDate <= endDate) {
  if (isWorkingDay(currentDate)) {
    validDates.push(new Date(currentDate));
  }
  currentDate.setDate(currentDate.getDate() + 1);
}

console.log(`Found ${validDates.length} working days.`);

// Distribute files into dates
let fileIndex = 0;
const filesPerDay = Math.ceil(allFiles.length / validDates.length);

for (const date of validDates) {
  if (fileIndex >= allFiles.length) break;
  
  const numCommitsToday = getRandomInt(1, Math.min(3, filesPerDay * 2));
  
  for (let i = 0; i < numCommitsToday; i++) {
    if (fileIndex >= allFiles.length) break;
    
    const file = allFiles[fileIndex];
    const relativePath = path.relative(rootDir, file);
    
    // Construct commit date/time
    const hour = getRandomInt(9, 17);
    const minute = getRandomInt(0, 59);
    const second = getRandomInt(0, 59);
    const commitDate = new Date(date);
    commitDate.setUTCHours(hour, minute, second);
    const dateString = commitDate.toISOString();
    
    const message = generateCommitMessage(file);
    
    const env = {
      ...process.env,
      GIT_AUTHOR_DATE: dateString,
      GIT_COMMITTER_DATE: dateString,
      GIT_AUTHOR_NAME: 'dangtienvn',
      GIT_AUTHOR_EMAIL: 'td2812009@gmail.com',
      GIT_COMMITTER_NAME: 'dangtienvn',
      GIT_COMMITTER_EMAIL: 'td2812009@gmail.com'
    };
    
    try {
      execSync(`git add "${file}"`, { cwd: rootDir, stdio: 'ignore' });
      execSync(`git commit -m "${message}"`, { cwd: rootDir, env, stdio: 'ignore' });
      console.log(`Committed: ${dateString} - ${message}`);
    } catch (e) {
      console.error(`Failed to commit ${relativePath}`);
    }
    
    fileIndex++;
  }
}

// Any remaining files, commit them on the last day
if (fileIndex < allFiles.length) {
  const lastDate = validDates[validDates.length - 1];
  lastDate.setUTCHours(18, 0, 0);
  const dateString = lastDate.toISOString();
  
  const env = {
    ...process.env,
    GIT_AUTHOR_DATE: dateString,
    GIT_COMMITTER_DATE: dateString,
    GIT_AUTHOR_NAME: 'dangtienvn',
    GIT_AUTHOR_EMAIL: 'td2812009@gmail.com',
    GIT_COMMITTER_NAME: 'dangtienvn',
    GIT_COMMITTER_EMAIL: 'td2812009@gmail.com'
  };
  
  for (let i = fileIndex; i < allFiles.length; i++) {
    const file = allFiles[i];
    execSync(`git add "${file}"`, { cwd: rootDir, stdio: 'ignore' });
  }
  execSync(`git commit -m "chore(core): finalize MVP implementation"`, { cwd: rootDir, env, stdio: 'ignore' });
  console.log(`Committed remaining ${allFiles.length - fileIndex} files.`);
}

console.log("Smart Git History generated successfully.");
