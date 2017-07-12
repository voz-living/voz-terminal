const blessed = require('blessed');
const { getForumList } = require('./utilities/forum');
const { getThreadList } = require('./utilities/thread');
const { getPostList } = require('./utilities/post');

class VozlivingTerminal {
  constructor() {
    this.forums = [];
    this.threads = [];
    this.posts = [];
    this.currentFocus = 'forum';
    this.currentPostIndex = 0;
    this.currentThreadPageNum = 0;

    this.screen = blessed.screen({
      autopadding: true,
      smartCSR: true,
      title: 'Vozliving termninal',
      fullUnicode: true,
    });

    this.screen.key(['q', 'C-c'], () => process.exit(0));
    
    this.screen.key(['escape'], () => {
      if (this.currentFocus !== 'forum') {
        if (this.currentFocus === 'thread') {
          this.currentFocus = 'forum';
        }
        if (this.currentFocus === 'post') {
          this.currentFocus = 'thread';
        }
        this.update();
      }
    });

    this.screen.key(['left', 'right'], (ch, key) => {
      if (this.currentFocus === 'post') {
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

    this.container = blessed.box({
      width: '100%',
      height: '100%',
      style: {
        fg: '#bbb',
        bg: '#1d1f21',
      },
    });

    this.sideBar = blessed.box({
      width: '30%',
      height: '100%',
    });

    this.contentBox = blessed.box({
      width: '70%',
      height: '100%',
      left: '30%',
    });

    this.contentTop = blessed.box({
      width: '100%',
      height: '50%',
    });

    this.contentBottom = blessed.box({
      width: '90%',
      height: '45%',
      top: '50%',
      left: '5%',
      label: 'Post',
      scrollable: true,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: '#ffffff',
        },
      },
    });

    this.forumList = blessed.list({
      width: '90%',
      height: '90%',
      left: '5%',
      top: '5%',
      keys: true,
      tags: true,
      label: 'Forums',
      border: {
        type: 'line',
      },
      style: {
        selected: {
          bg: '#373b41',
          fg: '#c5c8c6',
        },
        border: {
          fg: '#ffffff',
        },
      },
    });

    this.forumList.on('select', (data) => {
      const forumName = data.content;
      this.onForumListClick(forumName);
      this.update();
    });

    this.threadList = blessed.list({
      width: '90%',
      height: '90%',
      left: '5%',
      top: '10%',
      keys: true,
      tags: true,
      label: 'Threads',
      border: {
        type: 'line',
      },
      style: {
        selected: {
          bg: '#373b41',
          fg: '#c5c8c6',
        },
        border: {
          fg: '#ffffff',
        },
      },
    });

    this.threadList.on('select', (data) => {
      const threadId = data.content.split(' - ')[0];
      this.onThreadListClick(threadId);
      this.update();
    });
  }

  onThreadListClick(threadId) {
    this.loadPosts(threadId, 0);
    this.currentFocus = 'post';
  }

  onForumListClick(forumName) {
    const found = this.forums.find(f => f.title == forumName);
    this.loadThreads(found.id, 0);
    this.currentFocus = 'thread';
  }

  makePostBox(post, masterWidth) {
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
    this.contentBottom.setContent("");
    this.contentBottom.focus();
    this.contentBottom.append(this.makePostBox(post, this.contentBottom.width));
    this.update();
  }

  async loadPosts(id, page) {
    const [posts, pageNum, user, securityCode] = await getPostList(id, page);
    this.posts = posts;
    this.currentThreadPageNum = pageNum;
    this.setPost(this.posts[0]);
  }

  async loadThreads(id, page) {
    const [threads, pageNum] = await getThreadList(id, page);
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
      case 'post':
        this.contentBottom.focus();
        break;
      case 'thread':
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