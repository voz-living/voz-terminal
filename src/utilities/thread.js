const cheerio = require('cheerio-without-node-native');
const { GET } = require('./http');
const FORUM_URL = 'https://vozforums.com';
const { threads } = require('./parser');

async function getThreadList(id, pageNum = 0) {
  try {
    const url = pageNum > 1 ? `${FORUM_URL}/forumdisplay.php?f=${id}&page=${pageNum}` : `${FORUM_URL}/forumdisplay.php?f=${id}`;
    const response = await GET(url);
    return threads(response);
  } catch (error) {
    return [[], 0];
  }
}

module.exports = {
  getThreadList,
};
