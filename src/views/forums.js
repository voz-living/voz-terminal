"use strict";
const blessed = require('blessed');
const { getForumList } = require('../utilities/forum');
const styles = require('../styles');
let _listRef = {};

const massageForumsData = (forums, ref) => {
  // [name, threads, posts]
  let groupName = null;
  const data = [];
  let i=0;
  forums.forEach((f, idx) => {
    if (f.groupName != groupName) {
      data.push(['', `┬ {green-fg}{bold}${f.groupName}{/bold}{/}`, '' , '']);
      groupName = f.groupName;
      ref[i] = { isGroupEntry: true };
      i++;
    }
    data.push([f.id, `└─ ${f.name} ${f.viewing}`, f.threads, f.posts])
    ref[i] = f;
    i++
  });
  return data;
}

const headerRow = ['ID', 'Forum', 'Post', 'Views'];
async function loadForums(list) {
  const forums = await getForumList();
  list.deleteTop();
  list.setRows([headerRow].concat(massageForumsData(forums, _listRef)));
  list.focus();
}

function renderView({ on } = {}) {
  const view = blessed.box({
    width: '100%',
    height: '100%',
  });
  this.view = view;
  
  const list = blessed.listtable(Object.assign({}, styles.forumList, {
    keys: true,
    tags: true,
    mouse: true,
    width: '100%',
    height: '100%',
    rows: [['Loading forums']],
  }));
  view.append(list)
  loadForums(list);
  list.on('select', (evt, idx) => {
    const forum = _listRef[idx - 1];
    if(on) on.forumSelect(forum);
  });
  return view;
}

module.exports = { renderView };