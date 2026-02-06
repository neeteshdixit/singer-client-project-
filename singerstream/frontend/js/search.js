class ContentSearch {
  constructor() {
    this.initializeSearch();
  }

  initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.performSearch(e.target.value);
        }, 300);
      });
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', () => this.applyFilters());
    }

    if (sortFilter) {
      sortFilter.addEventListener('change', () => this.applyFilters());
    }
  }

  async performSearch(query) {
    const type = document.getElementById('typeFilter')?.value || '';
    const sort = document.getElementById('sortFilter')?.value || 'upload_date';

    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (type) params.append('type', type);
      params.append('sort', sort);
      params.append('limit', '50');

      const results = await api.get(`/content?${params.toString()}`);
      const content = results.content || results || [];
      this.displayResults(content);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  applyFilters() {
    const searchQuery = document.getElementById('searchInput')?.value || '';
    this.performSearch(searchQuery);
  }

  displayResults(content) {
    const container = document.getElementById('contentList');
    if (!container) return;

    if (!content.length) {
      container.innerHTML = '<p class="text-center">No content found</p>';
      return;
    }

    container.innerHTML = content.map(item => `
      <div class="content-item">
        <img src="${item.thumbnail_url || '/assets/default-thumbnail.jpg'}"
             alt="${item.title}" class="content-thumbnail">
        <div class="content-info">
          <h3 class="content-title">${item.title}</h3>
          <p class="content-meta">
            ${item.type.toUpperCase()} - ${item.views_count || 0} views - 
            ${new Date(item.upload_date).toLocaleDateString()}
          </p>
        </div>
        <button class="btn btn-primary" onclick="window.location.href='/player.html?id=${item.id}'">
          Play
        </button>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('searchInput')) {
    const search = new ContentSearch();
    search.performSearch('');
  }
});
