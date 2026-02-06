function setRegisterError(message) {
  const errorBox = document.getElementById('error');
  if (errorBox) {
    errorBox.textContent = message || '';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setRegisterError('');

  const username = document.getElementById('username')?.value?.trim();
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value || '';
  const button = event.target.querySelector('button[type="submit"]');

  if (!username || !password) {
    setRegisterError('Username and password are required.');
    return;
  }

  try {
    if (button) {
      button.disabled = true;
      button.textContent = 'Creating...';
    }
    await auth.register(username, email, password);
    window.location.href = '/fan-dashboard.html';
  } catch (error) {
    setRegisterError(error.message || 'Registration failed. Please try again.');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Sign Up';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (form) {
    form.addEventListener('submit', handleRegister);
  }

  if (auth.isLoggedIn()) {
    const role = auth.currentUser?.role;
    window.location.href = role === 'admin' ? '/admin-dashboard.html' : '/fan-dashboard.html';
  }
});
