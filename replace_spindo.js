const fs = require('fs');
const path = require('path');

const targetDirs = ['src', 'public', 'backend/src', 'prisma', 'backend/prisma'];

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
// Also include root level configuration and document files
const rootFiles = ['package.json', 'README.md', 'replace_name.js'];
rootFiles.forEach(file => {
  if (fs.existsSync(file)) {
    filesToProcess.push(file);
  }
});

filesToProcess.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace various casing
  content = content.replace(/LondriOS/g, 'Spindo');
  content = content.replace(/londrios/g, 'spindo');
  content = content.replace(/Londri<span className="text-brand-300">OS<\/span>/g, 'Spin<span className="text-brand-300">do<\/span>');
  content = content.replace(/Londri<span className="text-brand-600">OS<\/span>/g, 'Spin<span className="text-brand-600">do<\/span>');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('Replacement complete.');
