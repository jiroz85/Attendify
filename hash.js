const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 12);
console.log('HASH:', hash);
console.log('LENGTH:', hash.length);
console.log('VERIFY:', bcrypt.compareSync('admin123', hash));
