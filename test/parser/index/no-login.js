const fs = require('fs');
const path = require('path');
const { forums } = require('../../../src/utilities/parser');

console.log(forums(fs.readFileSync(path.join(__dirname, './no_login.html')).toString()));
