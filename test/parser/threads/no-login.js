const fs = require('fs');
const path = require('path');
const { threads } = require('../../../src/utilities/parser');

console.log(JSON.stringify(threads(fs.readFileSync(path.join(__dirname, './no_login.html')).toString()), null, 2));
