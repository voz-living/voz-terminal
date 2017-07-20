const container = {
  width: '100%',
  height: '100%',
  style: {
    fg: '#bbb',
    bg: '#1d1f21',
  },
}

const sideBar = {
  width: '30%',
  height: '100%',
}

const contentBox = {
  width: '70%',
  height: '100%',
  left: '30%',
}

const contentTop = {
  width: '100%',
  height: '50%',
}

const contentBottom = {
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
    focus: {
      border: {
        fg: 'red',
      }
    }
  },
}

const forumList = {
  border: {
    type: 'line',
  },
  align: 'left',
  pad: 3,
  style: {
    header: {
      fg: 'blue',
      bold: true,
      align: 'left',
    },
    cell: {
      fg: 'magenta',
      selected: {
        bg: 'blue'
      },
      align: 'left'
    },
    selected: {
      bg: '#373b41',
      fg: '#c5c8c6',
    },
    border: {
      fg: '#ffffff',
    },
    focus: {
      border: {
        fg: 'red',
      }
    }
  },
}

const threadList = {
  width: '90%',
  height: '90%',
  left: '5%',
  top: '10%',
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
    focus: {
      border: {
        fg: 'red',
      }
    }
  },
}

module.exports = {
  container,
  sideBar,
  contentBox,
  contentTop,
  contentBottom,
  forumList,
  threadList,
}