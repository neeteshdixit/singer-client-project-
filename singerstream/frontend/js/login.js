function setError(message) {
  const errorBox = document.getElementById('error');
  if (errorBox) {
    errorBox.textContent = message || '';
  }
}

async function handleLogin(event) {
  event.preventDefault();
  setError('');

  const username = document.getElementById('username')?.value?.trim();
  const password = document.getElementById('password')?.value || '';
  const button = event.target.querySelector('button[type="submit"]');

  if (!username || !password) {
    setError('Please enter your username and password.');
    return;
  }

  try {
    if (button) {
      button.disabled = true;
      button.textContent = 'Logging in...';
    }
    await auth.login(username, password);
    const role = auth.currentUser?.role;
    window.location.href = role === 'admin' ? '/admin-dashboard.html' : '/fan-dashboard.html';
  } catch (error) {
    setError(error.message || 'Login failed. Please try again.');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Login';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', handleLogin);
  }

  if (auth.isLoggedIn()) {
    const role = auth.currentUser?.role;
    window.location.href = role === 'admin' ? '/admin-dashboard.html' : '/fan-dashboard.html';
  }
});
