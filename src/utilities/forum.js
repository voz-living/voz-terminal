const { GET } = require('./http');
const parseForums = require('./parser').forums;

const FORUM_URL = 'https://vozforums.com';

async function getForumList() {
  try {
    const response = await GET(FORUM_URL);
    return parseForums(response);
  } catch (error) {
    console.log("ERROR", error);
    return [];
  }
}

module.exports = {
  parseForums,
  getForumList
}