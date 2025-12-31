const fs = require('fs');
const path = require('path');

function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findPageFiles(filePath, fileList);
    } else if (file === 'page.tsx' || file === 'page.jsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function addDynamicExport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it's a client component
  if (!content.includes("'use client'") && !content.includes('"use client"')) {
    return false;
  }
  
  // Check if dynamic export already exists
  if (content.includes("export const dynamic")) {
    return false;
  }
  
  // Add dynamic export after 'use client'
  const useClientPattern = /(['"]use client['"])\s*\n/;
  if (useClientPattern.test(content)) {
    content = content.replace(useClientPattern, "$1\n\nexport const dynamic = 'force-dynamic'\n");
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Find all page files
const appDir = path.join(__dirname, '..', 'app');
const pageFiles = findPageFiles(appDir);

let updated = 0;
pageFiles.forEach(file => {
  if (addDynamicExport(file)) {
    console.log(`Updated: ${file}`);
    updated++;
  }
});

console.log(`\n✅ Updated ${updated} files with dynamic export`);

