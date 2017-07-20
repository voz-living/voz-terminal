const blessed = require('blessed');
const { getPostList } = require('../utilities/post');
const styles = require('../styles');
const _listRef = {};
const massagePostsData = (post, ref) => {
  // [ID, title, lastPost, replies, views]
  const data = [];
  post.forEach((p, idx) => {
    console.log(p)
    data.push([`${p.id}`, `${p.content}`]);
    ref[idx] = p;
  });
  return data;
}

const headerRow = ['Info', 'Content'];

function renderView({ on, post, screen }) {
  const view = blessed.box({
    width: '100%',
    height: '100%',
  });
  
  // const list = blessed.table(Object.assign({}, styles.threadList, {
  //   keys: true,
  //   vi: true,
  //   tags: true,
  //   mouse: true,
  //   search: true,
  //   width: '100%',
  //   height: '100%',
  //   rows: [['Loading threads']],
  // }));
  // view.append(list)

  const box = blessed.box({
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    content: 'Loading',
    scrollable: true,
    shadow: true,
    keys: true,
    vi: true,
    alwaysScroll: true,
    border: {
      fg: 'blue',
      type: 'line',
    },
    scrollbar: {
      ch: ' ',
      track: {
        bg: 'yellow'
      },
      style: {
        inverse: true
      }
    },
    focus: {
      bg: 'red'
    },
    hover: {
      bg: 'red'
    }
  });

  view.append(box);
  
  loadThreads(box, screen, post.id)

  // list.on('select', (evt, idx) => {
  //   const thread = _listRef[idx - 1];
  //   on.postSelect(thread);
  // });
  return view;
}

async function loadThreads(box, screen, fid) {
  const {posts, meta} = await getPostList(fid);
  console.log(posts[0].content);
  box.setContent(posts.map((p) => `${p.poster.name}\n${p.content}`).join('\n------\n'));
  box.focus();
  screen.render();
  // list.setRows([headerRow].concat(massagePostsData(posts, _listRef)));
  // list.focus();
}

module.exports = { renderView };