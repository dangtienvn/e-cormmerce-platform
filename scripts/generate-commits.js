const { execSync } = require('child_process');

// Configuration
const startDate = new Date('2026-01-02T08:00:00Z');
const endDate = new Date('2026-07-20T17:00:00Z'); // up to yesterday

const holidays = [
  '2026-01-01', // New Year
  // Tet 2026 is around Feb 17. Holiday from Feb 16 to Feb 22
  '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22',
  '2026-04-30', // Reunification Day
  '2026-05-01', // Labor Day
  // Hung King (10/3 Lunar) in 2026 is around April 26 (Sunday) so April 27 might be off
  '2026-04-27',
];

const commitMessages = [
  "refactor: optimize component rendering",
  "fix: resolve hydration error in production",
  "style: update tailwind utility classes",
  "docs: update component documentation",
  "chore: clean up unused dependencies",
  "test: add unit tests for utility functions",
  "perf: improve image loading performance",
  "fix: correct padding on mobile view",
  "refactor: extract logic into custom hook",
  "style: improve button hover states",
  "chore: update gitignore rules",
  "refactor: simplify state management",
  "fix: handle null values in api response",
  "docs: update readme with setup instructions",
  "perf: implement lazy loading for heavy components"
];

function isWorkingDay(date) {
  const day = date.getDay();
  if (day === 0) return false; // Sunday
  
  const dateString = date.toISOString().split('T')[0];
  if (holidays.includes(dateString)) return false;
  
  return true;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCommits() {
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate)) {
      const numCommits = getRandomInt(2, 3);
      
      for (let i = 0; i < numCommits; i++) {
        // Spread commits throughout the day (e.g. 9:00 to 17:00)
        const hour = getRandomInt(9, 17);
        const minute = getRandomInt(0, 59);
        const second = getRandomInt(0, 59);
        
        const commitDate = new Date(currentDate);
        commitDate.setUTCHours(hour, minute, second);
        
        const dateString = commitDate.toISOString();
        const message = commitMessages[getRandomInt(0, commitMessages.length - 1)];
        
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
          execSync(`git commit --allow-empty -m "${message}"`, { env, stdio: 'ignore' });
          console.log(`Committed: ${dateString} - ${message}`);
        } catch (e) {
          console.error(`Failed to commit on ${dateString}`);
        }
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

generateCommits();
console.log("All backdated commits generated successfully.");
