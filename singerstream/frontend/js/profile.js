async function loadProfile() {
  try {
    const response = await api.get('/user/me');
    const user = response.user;
    if (!user) return;

    document.getElementById('username').textContent = user.username;
    document.getElementById('email').textContent = user.email || '';
    document.getElementById('role').textContent = user.role;

    document.getElementById('u1').textContent = user.username;
    document.getElementById('e1').textContent = user.email || '';
    document.getElementById('r1').textContent = user.role;
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!auth.requireAuth()) return;
  loadProfile();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => auth.logout());
  }
});
