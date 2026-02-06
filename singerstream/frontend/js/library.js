document.addEventListener('DOMContentLoaded', () => {
  if (!auth.requireAuth()) return;

  if (window.location.pathname.endsWith('/fan-dashboard.html') && auth.isAdmin()) {
    window.location.href = '/admin-dashboard.html';
    return;
  }

  const greeting = document.getElementById('userGreeting');
  if (greeting && auth.currentUser) {
    const role = auth.currentUser.role || 'fan';
    greeting.textContent = `Hi, ${auth.currentUser.username} (${role})`;
  }

  const adminLink = document.getElementById('adminLink');
  if (adminLink) {
    adminLink.style.display = auth.isAdmin() ? 'inline-flex' : 'none';
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => auth.logout());
  }

  const typeFilter = document.getElementById('typeFilter');
  if (typeFilter && auth.currentUser && auth.currentUser.role === 'fan') {
    typeFilter.value = 'song';
    typeFilter.disabled = true;
    typeFilter.title = 'Fans can only view songs';
  }
});
