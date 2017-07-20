require('./log').replaceDefaultLog();
const blessed = require('blessed');
const { VIEW } = require('./consts');
const viewForums = require('./views/forums');
const viewThreads = require('./views/threads');
const viewPosts = require('./views/posts');
console.log(`terminal@${new Date().getTime()}`);
let _screen;

function prepareScreen() {
  const scr = blessed.screen({
    autopadding: true,
    smartCSR: true,
    title: 'Voz Living Termninal',
    fullUnicode: true,
  });
  scr.key(['C-c'], () => process.exit(0)); // eslint-disable-line no-process-exit
  scr.key(['escape'], navigateBack); // eslint-disable-line no-process-exit
  scr.render();
  return scr;
}
const defaultViewData = { type: VIEW.FORUMLIST };
let _viewData = {};

const setViewData = (data) => _viewData = data;
const getViewData = (data) => _viewData;

const forumListEvt = {
  forumSelect: (forum) => {
    if (forum.isGroupEntry === true) return;
    changeView({ type: VIEW.FORUM, forum, lastView: getViewData()})
  }
}

const threadsEvt = {
  threadSelect: (post) => {
    changeView({ type: VIEW.THREAD, post, lastView: getViewData()});
  }
}

const postsEvt = {
  postSelect: (post) => {
    console.log(post);
  }
}
function changeView(container, screen, view) {
  let v;
  if (view.type == VIEW.FORUMLIST) {
    v = viewForums.renderView({ on: forumListEvt });
  } else if (view.type === VIEW.FORUM) {
    v = viewThreads.renderView({ on: threadsEvt, forum: view.forum });
  } else if (view.type === VIEW.THREAD) {
    v = viewPosts.renderView({ on: postsEvt, post: view.post, screen });
  } else {
    throw new Error(`Invalid view ${view.type}`);
  }
  container.children.forEach(c => container.remove(c));
  container.append(v);
  screen.render();
  setViewData(view);
}

function navigateBack() {
  const state = getViewData();
  if (state.lastView) {
    changeView(state.lastView);
  } else {
    console.log('No back')
  }
}

function drawWrapper({ screen }) {
  const ctn = blessed.box({
    width: '100%',
    height: '100%',
    style: {
      fg: '#bbb',
      bg: '#1d1f21',
    }
  })
  const text = blessed.text({
    content: 'Voz Living Terminal',
    left: 0,
    top: 0,
    width: '100%',
    height: 3,
    border: 'line',
    padding: { left: 1, top: 0, right: 1, bottom: 0},
    fg: 'white'
  });
  const content = blessed.box({
    width: '100%',
    height: '100%-3',
    top: 3,
    left: 0,
    // border: 'line'
  })
  ctn.append(text);
  ctn.append(content);
  screen.append(ctn);
  screen.render();
  return content;
}

function init(viewData = defaultViewData) {
  try {
    const screen = prepareScreen();
    setViewData(viewData);
    const container = drawWrapper({ screen });
    changeView = changeView.bind(null, container, screen)
    changeView(viewData);
    _screen = screen;
    return { screen };
  } catch (e) {
    console.log(e.stack)
  }
}

function detach() {
  if(_screen && _screen.destroy) {
    _screen.destroy();
    return true;
  }
  return false;
}

module.exports = {
  init,
  detach,
  getViewData,
}