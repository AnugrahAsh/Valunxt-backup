const fs = require('fs');
const b64 = fs.readFileSync(process.argv[2], 'utf8').trim();
const data = b64.replace(/^data:image\/png;base64,/, '');
fs.writeFileSync(process.argv[3], Buffer.from(data, 'base64'));
console.log('wrote', process.argv[3]);
