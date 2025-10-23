const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '..', 'public')));

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  Referer: 'https://www.google.com/'
};

const SOURCE_DEFINITIONS = {
  mania: {
    id: 'mania',
    name: '매니아 KBL 게시판',
    homepage: 'https://mania.kr/board/bbs/board.php?bo_table=kbl',
    encoding: 'EUC-KR',
    parser: parseMania
  },
  dcinside: {
    id: 'dcinside',
    name: '디시인사이드 남자농구 마이너 갤러리',
    homepage: 'https://gall.dcinside.com/mgallery/board/lists?id=kbl',
    encoding: 'EUC-KR',
    parser: parseDcInside
  },
  fmkorea: {
    id: 'fmkorea',
    name: '에펨코리아 농구 게시판 KBL 탭',
    homepage: 'https://www.fmkorea.com/index.php?mid=basketball&category=47038632',
    encoding: 'UTF-8',
    parser: parseFmKorea
  }
};

app.get('/api/sources', (req, res) => {
  const payload = Object.values(SOURCE_DEFINITIONS).map(({ parser, encoding, ...rest }) => rest);
  res.json(payload);
});

app.get('/api/sources/:id', async (req, res) => {
  const source = SOURCE_DEFINITIONS[req.params.id];
  if (!source) {
    return res.status(404).json({ error: '지원하지 않는 출처입니다.' });
  }

  try {
    const result = await fetchSource(source);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message || '게시글을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

app.get('/api/overview', async (req, res) => {
  const sources = Object.values(SOURCE_DEFINITIONS);
  try {
    const results = await Promise.all(
      sources.map((source) =>
        fetchSource(source).catch((error) => ({
          source: buildSourceMetadata(source),
          posts: [],
          error: error.message
        }))
      )
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: '게시글 목록을 통합하는 중 오류가 발생했습니다.' });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`KBL 게시글 모음 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

async function fetchSource(source) {
  const response = await axios.get(source.homepage, {
    headers: DEFAULT_HEADERS,
    responseType: 'arraybuffer',
    timeout: 15000
  });

  const decoded = iconv.decode(response.data, source.encoding || 'UTF-8');
  const $ = cheerio.load(decoded);
  const posts = source.parser($, source.homepage).slice(0, 20);
  return {
    source: buildSourceMetadata(source),
    posts,
    fetchedAt: new Date().toISOString()
  };
}

function buildSourceMetadata(source) {
  return {
    id: source.id,
    name: source.name,
    homepage: source.homepage
  };
}

function parseMania($, baseUrl) {
  const rows = $('table tbody tr, table tr');
  const items = [];

  rows.each((_, element) => {
    const row = $(element);
    if (row.find('td').length === 0) {
      return;
    }
    if (row.hasClass('notice')) {
      return;
    }

    const subjectCell = row.find('td.subject, td.td_subject, td.bo_subject, td.title');
    let linkElement = subjectCell.find('a').not('.notice').last();
    if (!linkElement || linkElement.length === 0) {
      linkElement = row.find('a').not('.notice').first();
    }

    const title = cleanupText(linkElement.text());

    if (!title || isNoticeRow(row)) {
      return;
    }

    const href = linkElement.attr('href');
    const author = cleanupText(row.find('td.name, td.td_name, td.writer, td.author').text());
    const date = cleanupText(row.find('td.time, td.datetime, td.td_date, td.regdate').text());
    const views = cleanupText(row.find('td.hit, td.td_hit, td.view').text());
    const comments = extractCommentCount(subjectCell.find('span.cnt_cmt, span.cnt, span.comment, span.cmt').text());

    if (!href || href === '#' || href.startsWith('javascript')) {
      return;
    }

    items.push({
      title,
      link: absoluteUrl(baseUrl, href),
      author: author || null,
      date: date || null,
      views: views || null,
      comments
    });
  });

  return items;
}

function parseDcInside($, baseUrl) {
  const rows = $('tr.ub-content.us-post');
  const items = [];

  rows.each((_, element) => {
    const row = $(element);
    if (row.find('td').length === 0) {
      return;
    }
    const linkElement = row.find('td.gall_tit a').not('.reply_numb').last();
    const title = cleanupText(linkElement.text());

    if (!title) {
      return;
    }

    const href = linkElement.attr('href');
    if (!href || href === '#' || href.startsWith('javascript')) {
      return;
    }

    const author = cleanupText(row.find('td.gall_writer, td.gall_writer .nickname').text());
    const date = cleanupText(row.find('td.gall_date, td.gall_date span').text());
    const views = cleanupText(row.find('td.gall_count').text());
    const comments = extractCommentCount(row.find('td.gall_tit a.reply_numb').text());

    items.push({
      title,
      link: absoluteUrl(baseUrl, href),
      author: author || null,
      date: date || null,
      views: views || null,
      comments
    });
  });

  return items;
}

function parseFmKorea($, baseUrl) {
  const rows = $('table tbody tr');
  const items = [];

  rows.each((_, element) => {
    const row = $(element);
    if (row.find('td').length === 0) {
      return;
    }
    const linkElement = row.find('td.title a:not(.category)').first();
    const title = cleanupText(linkElement.text());

    if (!title) {
      return;
    }

    const href = linkElement.attr('href');
    const author = cleanupText(row.find('td.author, td.nick, span.author, span.nickname').text());
    const date = cleanupText(row.find('td.time, td.date, td.regdate, span.time').text());
    const views = cleanupText(row.find('td.read, td.hit, td.view').text());
    const comments = extractCommentCount(row.find('td.title span.comment_count, td.title span.badge').text());

    if (!href || href === '#' || href.startsWith('javascript')) {
      return;
    }

    items.push({
      title,
      link: absoluteUrl(baseUrl, href),
      author: author || null,
      date: date || null,
      views: views || null,
      comments
    });
  });

  return items;
}

function cleanupText(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function isNoticeRow(row) {
  const noticeText = cleanupText(row.find('td.num, td.td_num').text());
  const badgeText = cleanupText(row.find('.notice, .label-notice').text());
  return noticeText === '공지' || noticeText === '공지사항' || badgeText.includes('공지');
}

function absoluteUrl(base, href = '') {
  if (!href) return base;
  if (href.startsWith('http')) return href;
  return new URL(href, base).href;
}

function extractCommentCount(text = '') {
  const cleaned = text.replace(/[^0-9]/g, '');
  if (!cleaned) {
    return 0;
  }
  return Number.parseInt(cleaned, 10);
}

module.exports = app;
