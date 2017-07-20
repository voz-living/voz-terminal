const fs = require('fs');
const path = require('path');
require('./src/log').replaceDefaultLog();

let _detach, _viewData, _getViewData;
function run() {
  if (_detach) {
    _viewData = _getViewData();
    console.log(`Detaching: ${_detach()} with viewData`, _viewData);
  }
  try {
    const { init, detach, getViewData } = require('./src/terminal');
    init(_viewData);
    _detach = detach;
    _getViewData = getViewData;
  } catch (e) {
    process.stdout.write('Error please fix' + '\n' + e.stack)
  }
}

function watch() {
  let TARGET_PATH = path.join(__dirname, './src');
  console.log('watch', TARGET_PATH);
  console.log('---------');
  fs.watch(TARGET_PATH, {recursive: true}, (eventType, filename) => {
    if (/hg-chec/.test(filename) || /^\.\w+/.test(filename) || /node_modules\//.test(filename)) return;
    console.log(`${filename} changed --`);
    const filePath = path.join(__dirname, 'src', filename);
    try {
      let parent = false;
      if (require.cache[filePath]) {
        parent = require.cache[filePath].parent;
      }
      while(parent) {
        const key = Object.keys(require.cache)[Object.values(require.cache).indexOf(parent)];
        parent = parent.parent;
        delete require.cache[key];
      }
      delete require.cache[filePath];
      run();
    } catch (e) {
      console.log(e.stack);
    }
  });
}
run();
watch();
