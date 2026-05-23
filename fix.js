const fs = require('fs');
const path = require('path');

// Fix executionService.ts
const execServicePath = 'src/services/executionService.ts';
if (fs.existsSync(execServicePath)) {
  let content = fs.readFileSync(execServicePath, 'utf8');
  content = content.replace(/catch\s*\(\(err\)\s*=>/g, 'catch ((err: any) =>');
  fs.writeFileSync(execServicePath, content);
}

// Fix Markdown headings
const dirs = ['charts', 'design-system', 'features', 'hooks', 'layouts', 'pages', 'services', 'store'];
dirs.forEach(d => {
  const readmePath = path.join('src', d, 'README.md');
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, 'utf8');
    content = content.replace(/^[\r\n]+/, ''); // remove leading blank lines
    content = content.replace(/^(# .*?)\r?\n([^\r\n])/m, '$1\n\n$2'); // add blank line after heading
    fs.writeFileSync(readmePath, content);
  }
});

// Fix Tailwind CSS Classes
const replacements = [
  ['min-h-[100dvh]', 'min-h-dvh'],
  ['[background-size:40px_40px]', 'bg-size-[40px_40px]'],
  ['min-w-[20px]', 'min-w-5'],
  ['md:min-w-[40px]', 'md:min-w-10'],
  ['max-h-[300px]', 'max-h-75'],
  ['min-h-[300px]', 'min-h-75'],
  ['top-[140px]', 'top-35'],
  ['min-h-[400px]', 'min-h-100'],
  ['bg-gradient-to-t', 'bg-linear-to-t'],
  ['[background-size:24px_24px]', 'bg-size-[24px_24px]'],
  ['z-[100]', 'z-100'],
  ['border-[2px]', 'border-2'],
  ['border-[1px]', 'border']
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/components', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated components: ' + filePath);
    }
  }
});
