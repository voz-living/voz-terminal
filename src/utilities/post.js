const { GET } = require('./http');
const FORUM_URL = 'https://vozforums.com';
const { posts } = require('./parser');

async function getPostList(id, pageNum = 1) {
  try {
    const url = `${FORUM_URL}/showthread.php?t=${id}&pp=20&page=${pageNum}`;
    const response = await GET(url);
    return posts(response);
  } catch (error) {
    return [[], 0];
  }
}

module.exports = {
  getPostList,
};
