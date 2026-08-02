const fs = require('fs');

function fixDuplicates(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');

    // regex to find `className="A" className="B"` or `className="A" \n className="B"`
    const regex = /className\s*=\s*(["'])(.*?)\1\s+className\s*=\s*(["'])(.*?)\3/g;
    
    // We might have multiple spaces or newlines between them
    const regex2 = /className\s*=\s*(["'])(.*?)\1(?:[\s\n\r]+)className\s*=\s*(["'])(.*?)\3/g;

    let previous = "";
    while (content !== previous) {
        previous = content;
        content = content.replace(regex2, (match, q1, c1, q2, c2) => {
            return `className="${c1} ${c2}"`;
        });
    }

    fs.writeFileSync(filepath, content);
}

fixDuplicates('Frontend/src/pages/Signup.jsx');
fixDuplicates('Frontend/src/admin/pages/AdminDashboard.jsx');
console.log("Fixed duplicates");
