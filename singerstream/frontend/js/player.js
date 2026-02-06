class MediaPlayer {
  constructor(audioElement, videoElement) {
    this.audioPlayer = audioElement;
    this.videoPlayer = videoElement;
    this.currentMedia = null;
  }

  async loadContent(contentId) {
    try {
      const content = await api.get(`/content/${contentId}`);

      if (content.type === 'video') {
        this.currentMedia = this.videoPlayer;
        this.audioPlayer.style.display = 'none';
        this.videoPlayer.style.display = 'block';
      } else {
        this.currentMedia = this.audioPlayer;
        this.videoPlayer.style.display = 'none';
        this.audioPlayer.style.display = 'block';
      }

      const token = localStorage.getItem(TOKEN_KEY);
      const baseUrl = content.file_url || `${API_BASE_URL}/content/stream/${content.id}`;
      const streamUrl = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;

      this.currentMedia.src = streamUrl;
      this.currentMedia.load();

      document.getElementById('contentTitle').textContent = content.title;
      document.getElementById('contentType').textContent = content.type.toUpperCase();
      document.getElementById('contentDescription').textContent = content.description || '';
    } catch (error) {
      console.error('Failed to load content:', error);
      alert('Failed to load content. Please try again.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!auth.requireAuth()) return;

  const backLink = document.getElementById('backLink');
  if (backLink) {
    backLink.href = auth.isAdmin() ? '/admin-dashboard.html' : '/fan-dashboard.html';
    backLink.textContent = auth.isAdmin() ? 'Back to Admin' : 'Back to Dashboard';
  }

  const audioEl = document.getElementById('audioPlayer');
  const videoEl = document.getElementById('videoPlayer');

  if (audioEl && videoEl) {
    window.player = new MediaPlayer(audioEl, videoEl);

    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');
    if (contentId) {
      player.loadContent(contentId);
    } else {
      document.getElementById('contentTitle').textContent = 'No content selected';
    }
  }
});
