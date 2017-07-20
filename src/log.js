const fs = require('fs');
const path = require('path');
const ws = fs.createWriteStream(path.join(__dirname, '../log.txt'), { flags: 'a' });

function serialise(o) {
  if (Array.isArray(o)) return '[' + o.map(e => serialise(e)).join(',') + ']';
  if (typeof o === 'object') return JSON.stringify(o, null, 2);
  return o;
}

function log() {
  let txt
  try {
    txt = Array.prototype.slice.call(arguments).map(a => serialise(a)).join(' ')
  } catch (e) {
    console.log(e.stack)
    txt = e;
  }
  ws.write(txt + '\n');
}

log.__replaced = true;

function replaceDefaultLog() {
  if (console.log.__replaced === true) return;
  console.log = log; // eslint-disable-line no-console
  global.log = log;
}

module.exports = {
  replaceDefaultLog,
}