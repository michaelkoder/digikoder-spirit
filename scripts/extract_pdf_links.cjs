const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'OUTILS MEDITATION .pdf');
if (!fs.existsSync(FILE)) {
  console.error('PDF not found:', FILE);
  process.exit(1);
}
const buf = fs.readFileSync(FILE);
// Replace non-printable bytes with space
let s = '';
for (let i = 0; i < buf.length; i++) {
  const ch = buf[i];
  if (ch >= 32 && ch <= 126) s += String.fromCharCode(ch);
  else s += ' ';
}
const re = /https?:\/\/[^\s\)\"'<>]+/gi;
const matches = Array.from(new Set((s.match(re) || []).map(m => m.trim())));
matches.sort();
for (const m of matches) console.log(m);
