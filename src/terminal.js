const blessed = require('blessed');
const { getForumList } = require('./utilities/forum');
const { getThreadList } = require('./utilities/thread');
const { getPostList } = require('./utilities/post');

const styles = require('./styles');
const { PANEL } = require('./consts');

class VozlivingTerminal {
  constructor() {
    this.forums = [];
    this.threads = [];
    this.posts = [];
    this.currentFocus = PANEL.FORUM;
    this.currentPostIndex = 0;
    this.currentThreadPageNum = 0;
    this.currentPost = null;

    this.screen = blessed.screen({
      autopadding: true,
      smartCSR: true,
      title: 'Vozliving termninal',
      fullUnicode: true,
    });

    this.screen.key(['q', 'C-c'], () => process.exit(0)); // eslint-disable-line no-process-exit
    
    this.screen.key(['escape'], () => {
      if (this.currentFocus !== PANEL.FORUM) {
        if (this.currentFocus === PANEL.THREAD) {
          this.currentFocus = PANEL.FORUM;
        }
        if (this.currentFocus === PANEL.POST) {
          this.currentFocus = PANEL.THREAD;
        }
        this.update();
      }
    });

    this.screen.key(['left', 'right'], (ch, key) => {
      if (this.currentFocus === PANEL.POST) {
        let newIndex = this.currentPostIndex;
        if (key.name === 'right') {
          newIndex += 1;
        } else {
          if (newIndex > 0) newIndex -= 1;
        }
        if (this.posts[newIndex]) {
          this.currentPostIndex = newIndex;
          this.setPost(this.posts[newIndex]);
        }
      }
    });

    this.container = blessed.box(styles.container);
    this.sideBar = blessed.box(styles.sideBar);
    this.contentBox = blessed.box(styles.contentBox);
    this.contentTop = blessed.box(styles.contentTop);
    this.contentBottom = blessed.box(styles.contentBottom)
    this.forumList = blessed.list(Object.assign({}, styles.forumList, {
      keys: true,
      tags: true,
      label: 'Forums',
    }));

    this.forumList.on('select', (data) => {
      const forumName = data.content;
      this.onForumListClick(forumName);
      this.update();
    });

    this.threadList = blessed.list(Object.assign({}, styles.threadList, {
      keys: true,
      tags: true,
      label: 'Threads',
    }));

    this.threadList.on('select', (data) => {
      const threadId = data.content.split(' - ')[0];
      this.onThreadListClick(threadId);
      this.update();
    });
  }

  onThreadListClick(threadId) {
    this.loadPosts(threadId, 0);
    this.currentFocus = PANEL.POST;
  }

  onForumListClick(forumName) {
    const found = this.forums.find(f => f.title == forumName);
    this.loadThreads(found.id, 0);
    this.currentFocus = PANEL.THREAD;
  }

  makePostBox(post) {
    const postContainer = blessed.box({
      width: '90%',
      left: '5%',
      height: '100%',
    });

    const user = blessed.box({
      width: '100%',
      height: '15%',
      top: '10%',
      content: `${post.user.name.trim()}`,
    });

    const content = blessed.box({
      width: '100%',
      height: '80%',
      top: '20%',
      content: post.content.text
    });

    postContainer.append(content);
    postContainer.append(user);
    return postContainer;
  }

  setPost(post) {
    this.contentBottom.focus();
    this.currentPost = this.makePostBox(post);
    this.contentBottom.append(this.currentPost);
    this.update();
  }

  async loadPosts(id, page) {
    if (this.currentPost) this.contentBottom.remove(this.currentPost);
    this.contentBottom.setContent('Loading posts...');
    const [posts, pageNum, /*user */, /* securityCode */] = await getPostList(id, page);
    this.posts = posts;
    this.currentThreadPageNum = pageNum;
    this.contentBottom.setContent('');
    this.setPost(this.posts[0]);
  }

  async loadThreads(id, page) {
    if (this.currentPost) this.contentBottom.remove(this.currentPost);
    this.threadList.setItems(['Loading threads...']);
    const [threads, /* pageNum */] = await getThreadList(id, page);
    this.threads = threads;
    this.threadList.setItems(this.threads.map(t => {
      return `${t.id} - ${t.title}`;
    }));
    this.threadList.focus();
    this.update();
  }

  async loadForums() {
    this.forums = await getForumList();
    this.forumList.deleteTop();
    this.forumList.setItems(this.forums.map(forum => forum.title));
    this.forumList.focus();
    this.update();
  }

  update() {
    switch (this.currentFocus) {
      case PANEL.POST:
        this.contentBottom.focus();
        break;
      case PANEL.THREAD:
        this.threadList.focus();
        break;
      default:
        this.forumList.focus();
        break;
    }
    this.screen.render();
  }

  init() {
    this.forumList.setItems(['Loading forum list...']);
    this.sideBar.append(this.forumList);
    this.contentTop.append(this.threadList);
    this.contentBox.append(this.contentTop);
    this.contentBox.append(this.contentBottom);
    this.container.append(this.sideBar);
    this.container.append(this.contentBox);
    this.screen.append(this.container);
    this.screen.render();
    this.loadForums();
  }
}

module.exports = VozlivingTerminal;