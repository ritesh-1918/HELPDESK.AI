const fs = require('fs');
const path = require('path');

// Load @babel/parser directly from MobileApp/node_modules
const babelParserPath = path.resolve(__dirname, '../MobileApp/node_modules/@babel/parser');
const parser = require(babelParserPath);

function checkFile(filePath) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  console.log(`Checking syntax for ${fullPath}...`);
  try {
    const code = fs.readFileSync(fullPath, 'utf8');
    parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'flow', 'classProperties']
    });
    console.log(`✅ No syntax errors found in ${filePath}!`);
  } catch (err) {
    console.error(`❌ Syntax error in ${filePath}:`);
    console.error(err.message);
    if (err.loc) {
      console.error(`At line ${err.loc.line}, column ${err.loc.column}`);
    }
    process.exit(1);
  }
}

checkFile('MobileApp/src/screens/user/TicketDetailScreen.js');
checkFile('MobileApp/src/screens/user/KnowledgeBaseScreen.js');
checkFile('MobileApp/src/screens/admin/AdminTicketDetailScreen.js');
checkFile('MobileApp/src/screens/admin/AdminSettingsScreen.js');
checkFile('MobileApp/src/screens/admin/AdminDashboardScreen.js');
checkFile('MobileApp/src/screens/admin/AdminTicketsScreen.js');
checkFile('MobileApp/src/screens/admin/AdminUsersScreen.js');
