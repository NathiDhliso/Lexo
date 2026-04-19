const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            /* Recurse into a subdirectory */
            results = results.concat(walk(file));
        } else { 
            /* Is a file */
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

const replacements = [
    // Colors to Neutral
    { regex: /bg-blue-(\d+)/g, replacement: 'bg-neutral-$1' },
    { regex: /text-blue-(\d+)/g, replacement: 'text-neutral-$1' },
    { regex: /border-blue-(\d+)/g, replacement: 'border-neutral-$1' },
    { regex: /ring-blue-(\d+)/g, replacement: 'ring-neutral-$1' },
    
    { regex: /bg-indigo-(\d+)/g, replacement: 'bg-neutral-$1' },
    { regex: /text-indigo-(\d+)/g, replacement: 'text-neutral-$1' },
    { regex: /border-indigo-(\d+)/g, replacement: 'border-neutral-$1' },
    
    { regex: /bg-purple-(\d+)/g, replacement: 'bg-neutral-$1' },
    { regex: /text-purple-(\d+)/g, replacement: 'text-neutral-$1' },
    
    { regex: /bg-cyan-(\d+)/g, replacement: 'bg-neutral-$1' },
    { regex: /text-cyan-(\d+)/g, replacement: 'text-neutral-$1' },
    
    { regex: /judicial-blue-(\d+)/g, replacement: 'neutral-$1' },
    { regex: /firm-primary-(\d+)/g, replacement: 'neutral-$1' },
    { regex: /firm-secondary-(\d+)/g, replacement: 'neutral-$1' },
    { regex: /firm-accent-(\d+)/g, replacement: 'neutral-$1' },

    // Status colors
    { regex: /bg-green-(\d+)/g, replacement: 'bg-status-success-$1' },
    { regex: /text-green-(\d+)/g, replacement: 'text-status-success-$1' },
    { regex: /border-green-(\d+)/g, replacement: 'border-status-success-$1' },
    { regex: /ring-green-(\d+)/g, replacement: 'ring-status-success-$1' },

    { regex: /bg-red-(\d+)/g, replacement: 'bg-status-error-$1' },
    { regex: /text-red-(\d+)/g, replacement: 'text-status-error-$1' },
    { regex: /border-red-(\d+)/g, replacement: 'border-status-error-$1' },
    { regex: /ring-red-(\d+)/g, replacement: 'ring-status-error-$1' },

    { regex: /bg-yellow-(\d+)/g, replacement: 'bg-status-warning-$1' },
    { regex: /text-yellow-(\d+)/g, replacement: 'text-status-warning-$1' },
    { regex: /border-yellow-(\d+)/g, replacement: 'border-status-warning-$1' },
    { regex: /ring-yellow-(\d+)/g, replacement: 'ring-status-warning-$1' },
];

let totalChanges = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(rule => {
        content = content.replace(rule.regex, rule.replacement);
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        totalChanges++;
    }
});

console.log(`Updated ${totalChanges} files.`);
