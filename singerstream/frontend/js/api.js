class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Build final URL: accept either full URLs or relative endpoints
  buildURL(endpoint) {
    if (!endpoint) return this.baseURL;
    if (/^https?:\/\//.test(endpoint)) return endpoint;
    return `${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = this.buildURL(endpoint);
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        let error;
        try { error = await response.json(); } catch (e) { error = { msg: response.statusText }; }
        throw new Error(error.msg || error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file (multipart/form-data)
  async upload(endpoint, formData) {
    const token = this.getToken();
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(this.buildURL(endpoint), {
      method: 'POST',
      headers,
      body: formData // Don't set Content-Type, browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || error.error || 'Upload failed');
    }

    return await response.json();
  }
}

const api = new APIClient();
