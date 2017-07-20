const blessed = require('blessed');
const { getThreadList } = require('../utilities/thread');
const styles = require('../styles');
const _listRef = {};
const massageThreadsData = (forums, ref) => {
  // [ID, title, lastPost, replies, views]
  const data = [];
  forums.forEach((t, idx) => {
    data.push([t.id, `${t.isSticky?'Sticky: ':''}${t.title} (${t.poster.name})`, t.lastPost.timeStr ,`${t.replies}/${t.pageNum}` , t.views]);
    ref[idx] = t;
  });
  return data;
}

const headerRow = ['ID', 'Title', 'Last Post', 'Reps/Page', 'Views'];

function renderView({ on, forum }) {
  const view = blessed.box({
    width: '100%',
    height: '100%',
  });
  
  const list = blessed.listtable(Object.assign({}, styles.forumList, {
    keys: true,
    vi: true,
    tags: true,
    mouse: true,
    search: true,
    width: '100%',
    height: '100%',
    rows: [['Loading threads']],
  }));
  view.append(list)
  
  loadThreads(list, forum.id);

  list.on('select', (evt, idx) => {
    const thread = _listRef[idx - 1];
    on.threadSelect(thread);
  });
  return view;
}

async function loadThreads(list, fid) {
  const {threads, pages} = await getThreadList(fid);
  list.setRows([headerRow].concat(massageThreadsData(threads, _listRef)));
  list.focus();
}

module.exports = { renderView };