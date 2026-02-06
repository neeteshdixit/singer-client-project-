const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'singerstream_token';
const USER_KEY = 'singerstream_user';

const CONTENT_TYPES = {
  SONG: 'song',
  PODCAST: 'podcast',
  VIDEO: 'video'
};

const ROUTES = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY: `${API_BASE_URL}/auth/verify`
  },
  CONTENT: {
    LIST: `${API_BASE_URL}/content`,
    SINGLE: (id) => `${API_BASE_URL}/content/${id}`,
    UPLOAD: `${API_BASE_URL}/content`
  },
  USER: {
    ME: `${API_BASE_URL}/user/me`,
    FAVORITES: `${API_BASE_URL}/user/favorites`
  },
  ADMIN: {
    USERS: `${API_BASE_URL}/admin/users`
  },
  ANALYTICS: {
    OVERVIEW: `${API_BASE_URL}/analytics/overview`,
    POPULAR: `${API_BASE_URL}/analytics/popular`
  }
};
