const fs = require('fs');
const path = require('path');
const dirs = ['charts', 'design-system', 'features', 'hooks', 'layouts', 'pages', 'services', 'store'];
dirs.forEach(d => {
  const readmePath = path.join('src', d, 'README.md');
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, 'utf8');
    
    // Replace literal '\n' if it exists at the start
    if (content.startsWith('\\n')) {
      content = content.substring(2);
    }
    
    // Remove leading empty space or newlines
    content = content.replace(/^[\s\r\n]+/, '');
    
    // Ensure one empty line after the heading
    content = content.replace(/^(# .*?)\r?\n([^\r\n])/m, '$1\n\n$2');
    
    fs.writeFileSync(readmePath, content);
  }
});
