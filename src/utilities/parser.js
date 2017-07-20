const cheerio = require('cheerio-without-node-native');

const HIDDEN_FORUMS = [
  {
    parent: 17,
    title: 'Điểm báo',
    id: 33,
    href: 'forumdisplay.php?f=33'
  }
];


function forums(html) {
  const forumGroups = cheerio('tbody[id^="collapseobj_forumbit"]', html);
  const forums = [];
  forumGroups.each((idx, group) => {
    const $group = cheerio(group);
    const groupName = $group.prev().find('a[href*=forumdisplay]').text();
    $group.find('> tr').each((idx, tr) => {
      try {
        const $tr = cheerio(tr);
        const $forumDiv = $tr.find('td[id^=f] > div');
        const $forumLink = $forumDiv.find('a');
        const name = $forumLink.text();
        const href = $forumLink.attr('href')
        const id = href.match(/forumdisplay\.php\?f=(\d+)/)[1];
        const viewing = $forumDiv.find('span').text();
        const posts = $tr.find('td').last().text();
        const threads = $tr.find('td').last().prev().text();
        const forum = {
          groupName,
          name,
          href,
          id,
          viewing,
          posts,
          threads,
        }
        forums.push(forum);
      } catch (e) {
        console.log(e);
        return;
      }
    })
  })
  return forums;
}

function parseThreadList(response) {
  const $TRs = cheerio('tbody[id^="threadbits_forum_"] > tr', response);
  const threads = [];
  $TRs.each((i, tr) => {
    try {
      const $tr = cheerio(tr);
      const $tdTitle = $tr.find('> td[id^=td_threadtitle_]');
      if ($tdTitle.length === 0) return;
      const excerpt = $tdTitle.attr('title');
      const id = $tdTitle.attr('id').match(/(\d+)/)[1];
      const poster = $tdTitle.find('span[onclick*="member.php?u="]').text();
      const $aTitle = $tdTitle.find('a[id^=thread_title_]');
      const title = $aTitle.text();
      const isSticky = $aTitle.hasClass('vozsticky');

      let pageNum = 1;
      const $pageLinks = $tr.find('a[href*="&page="]');
      if($pageLinks.length > 0) {
        try {
          pageNum = Math.max.apply(null, $pageLinks.map((i, e) => parseInt(cheerio(e).attr('href').match(/page=(\d+)/)[1])));
        } catch (e) {
          console.log(`Error while parsing pageNum for thread ${id}`, e.stack);
        }
      }

      const $tdMeta = $tr.find('> td[title*="Replies:"]');
      const repviewStr = $tdMeta.attr('title');
      const metaStr = $tdMeta.text().trim();
      const [lastTime, lastUser] =  metaStr.split(/[\n\t\r]/).filter(s => s.length > 0);
      const [, replies, views] = repviewStr.match(/.*Replies: *([\d,]+), *Views: *([\d,]+).*/);
      const thread = {
        id,
        excerpt,
        title,
        isSticky,
        pageNum,
        poster: {
          name: poster,
        },
        replies,
        views,
        lastPost: {
          timeStr: lastTime,
          byStr: lastUser,
        }
      }
      threads.push(thread);
    } catch (e) {
      console.log(`Fail to parse TR ${i}`, e.stack);
    }
  });
  return threads;
}

function parsePageNum(response) {
  const pageTexts = cheerio('.pagenav td.vbmenu_control', response);
  if (pageTexts) {
    const text = pageTexts.eq(0).text();
    const match = text.match(/(\d+)\sof\s(\d+)/);
    if (match) return parseInt(match[2], 10);
  }
  return 1;
}

function threads(html) {
  const threads = parseThreadList(html);
  const pages = parsePageNum(html);
  return {
    threads,
    pages,
  }
}

function parsePostMeta($) {
  let meta = {
    pageNum: 1,
    pageCurrent: 1,
  }
  $.find('.pagenav .vbmenu_control').each((i, e) => {
    const text = cheerio(e).text();
    const matches = text.match(/Page +(\d+) +of +(\d+)/)
    if (matches != null && matches.length >= 2) {
      meta.pageNum = parseInt(matches[2], 10);
      meta.pageCurrent = parseInt(matches[1], 10);
    }
  });
  // const pageNum = Math.max.apply($.find('.pagenav td > a[href*="&page="]').map((i, e) => parseInt(cheerio(e).attr('href').match(/page=(\d+)/)[1], 10)))
  return meta
}

function massagePostContent($) {
  let content = $.text().trim();
  while(content.indexOf('\t\t') > -1) {
    content = content.replace(/\t\t/g,'\t');
  }
  content = content.replace(/\n\t/g,'--');
  content = content.replace(/--([^-])/g, '--\n$1');
  return content;
}

function parsePostList($) {
  const posts = [];
  const $postTables = $.find('table.voz-postbit');
  $postTables.each((i, e) => {
    try {
      const $post = cheerio(e);
      const id = parseInt($post.attr('id').replace('post', ''), 10);
      const $trs = $post.find('> tr');
      const $date = $trs.first().find('> td');
      const dateStr = $date.find('div').last().text().trim();
      const $user = $trs.eq(1);
      const userName = $user.find('a.bigusername').text().trim();
      const userText = $user.text().trim();
      const [,jd] = userText.match(/Join Date: +(\d+-\d+)/)
      const [,postNum] = userText.match(/Posts: +([\d,]+)/)
      const content = massagePostContent($post.find('.voz-post-message'));
      const post = {
        dateStr,
        id,
        poster: {
          name: userName,
          jd,
          postNum,
        },
        content,
      }
      posts.push(post);
    } catch (e) {
      console.log('post', i, e.stack);
    }
  })
  return posts;
}

function posts(html) {
  const $ = cheerio(html);
  const posts = parsePostList($);
  const meta  = parsePostMeta($);
  return {
    posts,
    meta,
  }
}

module.exports = {
  forums,
  threads,
  posts,
};