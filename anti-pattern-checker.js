const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkAntiPatterns() {
  console.log('🔍 Checking for Cucumber.js anti-patterns...\n');

  const stepsDir = path.join(__dirname, 'src', 'steps');
  const featuresDir = path.join(__dirname, 'features');
  const examplesDir = path.join(__dirname, 'examples');

  // Include examples directory in search
  const allDirs = [stepsDir, featuresDir, examplesDir].filter(dir => fs.existsSync(dir));
  
  let warningCount = 0;
  const fileIssues = {}; // Track issues per file
  const cleanFiles = new Set(); // Track files with no issues

  // Get all files to analyze
  const allFiles = [];
  allDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = getAllFiles(dir).filter(file => 
        file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.feature')
      );
      allFiles.push(...files);
    }
  });

  // Initialize clean files set
  allFiles.forEach(file => cleanFiles.add(file));

  // 1. Feature-coupled step definitions
  console.log('1. 🔗 Checking for feature-coupled step definitions...');
  allDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = getAllFiles(dir).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
      files.forEach(file => {
        const baseName = path.basename(file, path.extname(file));
        if (baseName.includes('_steps') && baseName.split('_').length > 2) {
          addFileIssue(fileIssues, file, 'Feature-Coupled Naming', 
            `File named after specific feature instead of domain concept`, 
            `Rename to domain concepts like 'user_steps.ts'`,
            `Feature-coupled step definitions can't be reused across features or scenarios. This leads to code duplication, explosion of step definitions, and high maintenance costs.`);
          cleanFiles.delete(file);
          warningCount++;
        }
      });
    }
  });

  // 2. Conjunction steps in feature files
  console.log('2. 🔀 Checking for conjunction steps in scenarios...');
  try {
    const conjunctionPatterns = [
      'Given.*\\band\\b.*\\band\\b',  // "Given X and Y and Z"
      'When.*\\band\\b.*\\band\\b',   // "When X and Y and Z"  
      'Then.*\\band\\b.*\\band\\b'    // "Then X and Y and Z"
    ];
    
    conjunctionPatterns.forEach(pattern => {
      try {
        const grepCmd = `grep -r -n "${pattern}" ${allDirs.join(' ')} --include="*.feature" 2>/dev/null || true`;
        const grepResult = execSync(grepCmd, { encoding: 'utf8' });
        if (grepResult.trim()) {
          grepResult.trim().split('\n').forEach(line => {
            const [filePath, lineNum, content] = parseGrepOutput(line);
            if (filePath) {
              addFileIssue(fileIssues, filePath, 'Conjunction Steps', 
                `Line ${lineNum}: Multiple actions in single step`, 
                `Split into atomic steps using 'And' between lines`,
                `Conjunction steps combine multiple actions, making them too specialized and hard to reuse. Cucumber has built-in support for 'And' and 'But' for a reason - use them to keep steps atomic.`);
              cleanFiles.delete(filePath);
              warningCount++;
            }
          });
        }
      } catch (e) { /* ignore */ }
    });
  } catch (error) {
    // Silent fail for grep errors
  }

  // 3. UI-coupled steps
  console.log('3. 🎨 Checking for UI-coupled step definitions...');
  try {
    const uiPatterns = [
      'click.*button.*color',
      'blue.*button|red.*button|green.*button',
      'top.*navigation|bottom.*footer|left.*sidebar',
      'scroll.*down|scroll.*up',
      'press.*key|Ctrl\\+|F5.*key'
    ];
    
    uiPatterns.forEach(pattern => {
      try {
        const grepCmd = `grep -r -n -i "${pattern}" ${allDirs.join(' ')} --include="*.ts" --include="*.js" --include="*.feature" 2>/dev/null || true`;
        const grepResult = execSync(grepCmd, { encoding: 'utf8' });
        if (grepResult.trim()) {
          grepResult.trim().split('\n').slice(0, 5).forEach(line => {
            const [filePath, lineNum, content] = parseGrepOutput(line);
            if (filePath) {
              addFileIssue(fileIssues, filePath, 'UI-Coupled Steps', 
                `Line ${lineNum}: References visual/layout details`, 
                `Focus on behavior, use data-testid selectors`,
                `UI-coupled steps break when visual design changes (colors, positions, layouts). They make tests brittle and tie business scenarios to implementation details rather than user intent.`);
              cleanFiles.delete(filePath);
              warningCount++;
            }
          });
        }
      } catch (e) { /* ignore */ }
    });
  } catch (error) {
    // Silent fail
  }

  // 4. Imperative vs Declarative steps
  console.log('4. 📝 Checking for overly imperative steps...');
  try {
    const imperativePatterns = [
      'click.*and.*clear.*and.*type',
      'navigate.*via.*URL.*bar',
      'wait.*for.*page.*to.*load.*completely',
      'select.*all.*text.*and.*typing'
    ];
    
    imperativePatterns.forEach(pattern => {
      try {
        const grepCmd = `grep -r -n -i "${pattern}" ${allDirs.join(' ')} --include="*.feature" 2>/dev/null || true`;
        const grepResult = execSync(grepCmd, { encoding: 'utf8' });
        if (grepResult.trim()) {
          grepResult.trim().split('\n').slice(0, 3).forEach(line => {
            const [filePath, lineNum, content] = parseGrepOutput(line);
            if (filePath) {
              addFileIssue(fileIssues, filePath, 'Imperative Steps', 
                `Line ${lineNum}: Describes HOW instead of WHAT`, 
                `Use declarative language focusing on business intent`,
                `Imperative steps describe the mechanics of interaction rather than business intent. They make scenarios harder to read, less maintainable, and couple tests to specific UI implementations.`);
              cleanFiles.delete(filePath);
              warningCount++;
            }
          });
        }
      } catch (e) { /* ignore */ }
    });
  } catch (error) {
    // Silent fail
  }

  // 5. Too many implementation details
  console.log('5. 🔬 Checking for excessive implementation details...');
  try {
    const detailPatterns = [
      'DOM.*contains',
      'network.*requests.*finished',
      'fade-in.*animation',
      'checkmark.*icon',
      'data-testid.*[\'"][^\'"]*[\'"].*input.*field'
    ];
    
    detailPatterns.forEach(pattern => {
      try {
        const grepCmd = `grep -r -n -i "${pattern}" ${allDirs.join(' ')} --include="*.feature" 2>/dev/null || true`;
        const grepResult = execSync(grepCmd, { encoding: 'utf8' });
        if (grepResult.trim()) {
          grepResult.trim().split('\n').slice(0, 3).forEach(line => {
            const [filePath, lineNum, content] = parseGrepOutput(line);
            if (filePath) {
              addFileIssue(fileIssues, filePath, 'Technical Details', 
                `Line ${lineNum}: Excessive implementation details in scenario`, 
                `Keep scenarios business-focused, hide tech details in step implementations`,
                `Business scenarios should be readable by non-technical stakeholders. Technical details (DOM, network requests, animations) belong in step implementations, not in the business-readable feature files.`);
              cleanFiles.delete(filePath);
              warningCount++;
            }
          });
        }
      } catch (e) { /* ignore */ }
    });
  } catch (error) {
    // Silent fail
  }

  const TABLE_WIDTH = 100;
  const HEADER_BORDER = '='.repeat(TABLE_WIDTH + 2);
  
  console.log('\n' + HEADER_BORDER);
  console.log('📊 ANALYSIS RESULTS');
  console.log(HEADER_BORDER);

  // Display results in table format
  if (Object.keys(fileIssues).length > 0) {
    console.log('\n⚠️  FILES WITH ISSUES:');
    
    const TABLE_WIDTH = 100;
    const BORDER = '─'.repeat(TABLE_WIDTH);
    
    Object.entries(fileIssues).forEach(([filePath, issues]) => {
      const fileName = path.relative(__dirname, filePath);
      const fileNameTruncated = fileName.length > TABLE_WIDTH - 8 ? 
        fileName.substring(0, TABLE_WIDTH - 11) + '...' : fileName;
      
      console.log('┌─' + BORDER + '┐');
      console.log(`│ FILE: ${fileNameTruncated.padEnd(TABLE_WIDTH - 7)} │`);
      console.log('├─' + BORDER + '┤');
      
      issues.forEach((issue, index) => {
        // Issue line: "1. Issue Type | Description"
        const issueNum = `${index + 1}.`.padEnd(3);
        const issueType = issue.type.padEnd(20);
        const remainingWidth = TABLE_WIDTH - 28; // Account for number, type, and separators
        
        const descriptionLines = wrapText(issue.description, remainingWidth, '');
        descriptionLines.forEach((line, lineIndex) => {
          if (lineIndex === 0) {
            console.log(`│ ${issueNum}${issueType} │ ${line} │`);
          } else {
            console.log(`│ ${' '.repeat(23)} │ ${line} │`);
          }
        });
        
        // Why lines
        const whyWidth = TABLE_WIDTH - 10; // Account for "WHY: " and borders
        const whyLines = wrapText(issue.why, whyWidth, '');
        whyLines.forEach((line, lineIndex) => {
          if (lineIndex === 0) {
            console.log(`│   WHY: ${line} │`);
          } else {
            console.log(`│       ${line} │`);
          }
        });
        
        // Solution lines
        const solutionWidth = TABLE_WIDTH - 14; // Account for "SOLUTION: " and borders
        const solutionLines = wrapText(issue.solution, solutionWidth, '');
        solutionLines.forEach((line, lineIndex) => {
          if (lineIndex === 0) {
            console.log(`│   SOLUTION: ${line} │`);
          } else {
            console.log(`│           ${line} │`);
          }
        });
        
        if (index < issues.length - 1) {
          console.log('│' + ' '.repeat(TABLE_WIDTH) + '│');
        }
      });
      console.log('└─' + BORDER + '┘');
      console.log('');
    });
  }

  // Display clean files
  if (cleanFiles.size > 0) {
    console.log('✅ FILES WITH NO ISSUES:');
    
    const TABLE_WIDTH = 100;
    const BORDER = '─'.repeat(TABLE_WIDTH);
    
    console.log('┌─' + BORDER + '┐');
    Array.from(cleanFiles).forEach(filePath => {
      const fileName = path.relative(__dirname, filePath);
      const displayWidth = TABLE_WIDTH - 9; // Account for "CLEAN: " and borders
      const displayName = fileName.length > displayWidth ? 
        fileName.substring(0, displayWidth - 3) + '...' : 
        fileName.padEnd(displayWidth);
      console.log(`│ CLEAN: ${displayName} │`);
    });
    console.log('└─' + BORDER + '┘');
  }

  // Summary
  console.log('\n' + HEADER_BORDER);
  if (warningCount === 0) {
    console.log('🎉 EXCELLENT! No anti-patterns detected across all files.');
    console.log('Your code follows Cucumber best practices for maintainable BDD automation.');
  } else {
    console.log(`⚠️  SUMMARY: Found ${warningCount} anti-pattern issue(s) across ${Object.keys(fileIssues).length} file(s).`);
    console.log(`✅ CLEAN: ${cleanFiles.size} file(s) follow best practices.`);
    console.log('\n� TIPS FOR SUCCESS:');
    console.log('   • Focus on business behavior, not UI implementation details');
    console.log('   • Keep steps atomic and reusable across multiple scenarios');  
    console.log('   • Use declarative language (WHAT) rather than imperative (HOW)');
    console.log('   • Organize steps by domain concepts, not by features');
    console.log('   • Hide technical details in step implementations, not scenarios');
    console.log('\n📚 Official Guide: https://cucumber.io/docs/guides/anti-patterns/');
  }
  console.log(HEADER_BORDER);
}

// Helper function to recursively get all files
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Helper function to add issue to file tracking
function addFileIssue(fileIssues, filePath, type, description, solution, why) {
  if (!fileIssues[filePath]) {
    fileIssues[filePath] = [];
  }
  fileIssues[filePath].push({
    type,
    description,
    solution,
    why
  });
}

// Helper function to parse grep output
function parseGrepOutput(grepLine) {
  const match = grepLine.match(/^([^:]+):(\d+):(.*)$/);
  if (match) {
    return [match[1], match[2], match[3].trim()];
  }
  return [null, null, null];
}

// Helper function to wrap text to multiple lines
function wrapText(text, maxWidth, prefix = '') {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is longer than max width, just add it
        lines.push(word);
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.map((line, index) => {
    if (index === 0) {
      return `${prefix}${line.padEnd(maxWidth)}`;
    } else {
      return `${' '.repeat(prefix.length)}${line.padEnd(maxWidth)}`;
    }
  });
}

checkAntiPatterns();