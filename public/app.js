const sourcesContainer = document.getElementById('sources');
const sourceTemplate = document.getElementById('source-template');
const postTemplate = document.getElementById('post-template');
const lastUpdatedLabel = document.getElementById('last-updated');
const refreshButton = document.getElementById('refresh-button');

let isLoading = false;

async function loadOverview() {
  if (isLoading) return;
  setLoadingState(true);

  try {
    const response = await fetch('/api/overview');
    if (!response.ok) {
      throw new Error('서버 응답을 불러오지 못했습니다.');
    }

    const overview = await response.json();
    renderSources(overview);
    updateTimestamp(new Date());
  } catch (error) {
    console.error(error);
    showGlobalError(error.message || '알 수 없는 오류가 발생했습니다.');
  } finally {
    setLoadingState(false);
  }
}

function renderSources(items) {
  sourcesContainer.innerHTML = '';
  if (!Array.isArray(items) || items.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'status error';
    emptyMessage.textContent = '표시할 게시글이 없습니다. 잠시 후 다시 시도해주세요.';
    sourcesContainer.appendChild(emptyMessage);
    return;
  }

  items.forEach((item) => {
    const card = sourceTemplate.content.firstElementChild.cloneNode(true);
    const title = card.querySelector('.source-title');
    const link = card.querySelector('.source-link');
    const status = card.querySelector('.status');
    const list = card.querySelector('.post-list');

    title.textContent = item.source?.name || '알 수 없는 출처';
    link.href = item.source?.homepage || '#';

    if (item.error) {
      status.textContent = `게시글을 불러오지 못했습니다: ${item.error}`;
      status.classList.add('error');
    } else if (!item.posts || item.posts.length === 0) {
      status.textContent = '게시글이 없습니다.';
    } else {
      status.textContent = `${item.posts.length}개의 게시글을 불러왔습니다.`;
    }

    if (Array.isArray(item.posts)) {
      item.posts.forEach((post) => {
        const postNode = postTemplate.content.firstElementChild.cloneNode(true);
        const postLink = postNode.querySelector('.post-link');
        const postMeta = postNode.querySelector('.post-meta');

        postLink.textContent = post.title || '제목 없음';
        postLink.href = post.link || '#';

        const metaFragments = [];
        if (post.author) metaFragments.push(`작성자: ${post.author}`);
        if (post.date) metaFragments.push(`작성일: ${post.date}`);
        if (post.views) metaFragments.push(createBadge(`조회 ${post.views}`));
        if (typeof post.comments === 'number') {
          metaFragments.push(createBadge(`댓글 ${post.comments}`));
        }

        postMeta.innerHTML = '';
        metaFragments.forEach((fragment) => {
          if (typeof fragment === 'string') {
            const span = document.createElement('span');
            span.textContent = fragment;
            postMeta.appendChild(span);
          } else {
            postMeta.appendChild(fragment);
          }
        });

        list.appendChild(postNode);
      });
    }

    sourcesContainer.appendChild(card);
  });
}

function createBadge(text) {
  const span = document.createElement('span');
  span.className = 'badge';
  span.textContent = text;
  return span;
}

function showGlobalError(message) {
  sourcesContainer.innerHTML = '';
  const alert = document.createElement('div');
  alert.className = 'status error';
  alert.textContent = message;
  sourcesContainer.appendChild(alert);
}

function updateTimestamp(date) {
  lastUpdatedLabel.textContent = `최근 갱신: ${formatKoreanDate(date)}`;
}

function formatKoreanDate(date) {
  if (!(date instanceof Date)) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function setLoadingState(state) {
  isLoading = state;
  refreshButton.disabled = state;
  refreshButton.textContent = state ? '불러오는 중…' : '새로고침';
}

refreshButton.addEventListener('click', () => {
  loadOverview();
});

window.addEventListener('DOMContentLoaded', () => {
  loadOverview();
});
