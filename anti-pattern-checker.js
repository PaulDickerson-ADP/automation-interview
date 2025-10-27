const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkAntiPatterns() {
  console.log('Checking for Cucumber.js anti-patterns...\n');

  const stepsDir = path.join(__dirname, 'src', 'steps');
  const featuresDir = path.join(__dirname, 'features');

  // 1. Feature-coupled step definitions
  console.log('1. Checking for feature-coupled step definitions:');
  if (fs.existsSync(stepsDir)) {
    const stepFiles = fs.readdirSync(stepsDir).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    stepFiles.forEach(file => {
      const baseName = path.basename(file, path.extname(file));
      if (baseName.includes('_steps') && baseName.split('_').length > 2) {
        console.log(`   WARNING: ${file} appears to be feature-coupled (named after a specific feature). Consider renaming to a domain concept.`);
      }
    });
  } else {
    console.log('   No steps directory found.');
  }

  // 2. Conjunction steps
  console.log('\n2. Checking for conjunction steps:');
  try {
    const grepResult = execSync(`grep -r "Given.*and\\|When.*and\\|Then.*and" ${featuresDir} ${stepsDir} --include="*.feature" --include="*.ts" --include="*.js"`, { encoding: 'utf8' });
    if (grepResult.trim()) {
      console.log('   WARNING: Found potential conjunction steps:');
      console.log(grepResult);
    } else {
      console.log('   No conjunction steps found.');
    }
  } catch (error) {
    console.log('   No conjunction steps found.');
  }

  console.log('\nAnti-pattern check complete.');
}

checkAntiPatterns();