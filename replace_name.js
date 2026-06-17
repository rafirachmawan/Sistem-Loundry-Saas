const fs = require('fs');
const path = require('path');

const targetDirs = ['src', 'public'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}

let filesToProcess = [];
targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    filesToProcess = filesToProcess.concat(walk(dir));
  }
});
// also check layout in root if any, but it's in src/app

filesToProcess.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace various casing
  content = content.replace(/LaundrSaaS/g, 'LondriOS');
  content = content.replace(/LoundrySaas/ig, 'LondriOS');
  content = content.replace(/laundrySaas/ig, 'LondriOS');
  content = content.replace(/laundrsaas/ig, 'londrios');
  content = content.replace(/Laundr<span className="text-brand-300">SaaS<\/span>/g, 'Londri<span className="text-brand-300">OS</span>');
  content = content.replace(/Laundr<span className="text-brand-600">SaaS<\/span>/g, 'Londri<span className="text-brand-600">OS</span>');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('Replacement complete.');
