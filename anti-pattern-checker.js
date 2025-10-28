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
            `Rename to domain concepts like 'user_steps.ts'`);
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
                `Split into atomic steps using 'And' between lines`);
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
                `Focus on behavior, use data-testid selectors`);
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
                `Use declarative language focusing on business intent`);
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
                `Keep scenarios business-focused, hide tech details in step implementations`);
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
        const description = issue.description.length > remainingWidth ? 
          issue.description.substring(0, remainingWidth - 3) + '...' : 
          issue.description.padEnd(remainingWidth);
        
        console.log(`│ ${issueNum}${issueType} │ ${description} │`);
        
        // Solution line
        const solutionWidth = TABLE_WIDTH - 14; // Account for "SOLUTION: " and borders
        const solution = issue.solution.length > solutionWidth ? 
          issue.solution.substring(0, solutionWidth - 3) + '...' : 
          issue.solution.padEnd(solutionWidth);
        
        console.log(`│   SOLUTION: ${solution} │`);
        
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
  } else {
    console.log(`⚠️  SUMMARY: Found ${warningCount} anti-pattern issue(s) across ${Object.keys(fileIssues).length} file(s).`);
    console.log(`✅ CLEAN: ${cleanFiles.size} file(s) follow best practices.`);
    console.log('\n📚 Learn more: https://cucumber.io/docs/guides/anti-patterns/');
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
function addFileIssue(fileIssues, filePath, type, description, solution) {
  if (!fileIssues[filePath]) {
    fileIssues[filePath] = [];
  }
  fileIssues[filePath].push({
    type,
    description,
    solution
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

checkAntiPatterns();