import fs from 'fs';
import path from 'path';

function addJsExtension(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const importRegex = /import\s+(?:(?:\w+(?:\s*,\s*{\s*[\w\s,]+\s*})?|\*\s+as\s+\w+|\{\s*[\w\s,]+\s*})\s+from\s+)?['"]([^'"]+)['"]/g;
  const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g;

  function processImport(match, importPath) {
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      if (!importPath.endsWith('.js') && !path.extname(importPath)) {
        return match.replace(importPath, `${importPath}.js`);
      }
    }
    return match;
  }

  content = content.replace(importRegex, processImport);
  content = content.replace(requireRegex, processImport);

  fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.js')) {
      addJsExtension(filePath);
    }
  });
}

const distDir = path.join(process.cwd(), 'dist');
processDirectory(distDir);

console.log('Added .js extensions to imports in dist directory');