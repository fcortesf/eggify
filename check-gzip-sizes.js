import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function checkGzipSize(filePath) {
    const content = fs.readFileSync(filePath);
    const gzippedContent = zlib.gzipSync(content);
    
    return {
        original: content.length,
        gzipped: gzippedContent.length,
        compression: ((1 - gzippedContent.length / content.length) * 100).toFixed(2)
    };
}

const distDir = './dist';
const files = fs.readdirSync(distDir).filter(file => fs.statSync(path.join(distDir, file)).isFile());

console.log('📦 Gzipped File Sizes Analysis\n');
console.log('File'.padEnd(20), 'Original'.padEnd(12), 'Gzipped'.padEnd(12), 'Savings');
console.log('='.repeat(60));

let totalOriginal = 0;
let totalGzipped = 0;

files.forEach(file => {
    const filePath = path.join(distDir, file);
    const sizes = checkGzipSize(filePath);
    
    totalOriginal += sizes.original;
    totalGzipped += sizes.gzipped;
    
    console.log(
        file.padEnd(20),
        formatBytes(sizes.original).padEnd(12),
        formatBytes(sizes.gzipped).padEnd(12),
        `${sizes.compression}%`
    );
});

console.log('='.repeat(60));
console.log(
    'TOTAL'.padEnd(20),
    formatBytes(totalOriginal).padEnd(12),
    formatBytes(totalGzipped).padEnd(12),
    `${((1 - totalGzipped / totalOriginal) * 100).toFixed(2)}%`
);

// AI Generated Code - End