class AuthManager {
  constructor() {
    this.currentUser = this.loadUser();
  }

  loadUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  saveUser(user, token) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
    this.currentUser = user;
  }

  clearUser() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.currentUser = null;
  }

  isLoggedIn() {
    return !!this.currentUser && !!localStorage.getItem(TOKEN_KEY);
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  async register(username, email, password) {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      });

      if (response.user && response.token) {
        this.saveUser(response.user, response.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async login(username, password) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });

      if (response.user && response.token) {
        this.saveUser(response.user, response.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    this.clearUser();
    window.location.href = '/login.html';
  }

  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      if (!response.valid) {
        this.clearUser();
        return false;
      }
      if (response.user) {
        this.currentUser = response.user;
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      }
      return true;
    } catch (error) {
      this.clearUser();
      return false;
    }
  }

  // Protect page (redirect to login if not authenticated)
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  }

  // Protect admin pages
  requireAdmin() {
    if (!this.isLoggedIn()) {
      window.location.href = '/login.html';
      return false;
    }
    if (!this.isAdmin()) {
      alert('Admin access required');
      window.location.href = '/index.html';
      return false;
    }
    return true;
  }
}

const auth = new AuthManager();
