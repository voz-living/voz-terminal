const fs = require('fs');
const path = require('path');
const { posts } = require('../../../src/utilities/parser');

console.log(JSON.stringify(posts(fs.readFileSync(path.join(__dirname, './post.html')).toString()), null, 2));
