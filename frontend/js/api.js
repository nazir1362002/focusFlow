const API_BASE = ''; // same origin (Express serves frontend)

// Get token from localStorage
function getToken() {
  return localStorage.getItem('focusflow_token');
}

// Save token
function saveToken(token) {
  localStorage.setItem('focusflow_token', token);
}

// Remove token (logout)
function removeToken() {
  localStorage.removeItem('focusflow_token');
  localStorage.removeItem('focusflow_user');
}

// Save user info
function saveUser(user) {
  localStorage.setItem('focusflow_user', JSON.stringify(user));
}

function getUser() {
  const user = localStorage.getItem('focusflow_user');
  return user ? JSON.parse(user) : null;
}

// Generic fetch helper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0]?.msg || 'Something went wrong');
  }

  return data;
}

// Auth specific helpers
async function registerUser(name, email, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
}

async function loginUser(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

async function getMe() {
  return apiRequest('/api/auth/me');
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Redirect if not logged in
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
  }
}

// Redirect if already logged in
function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = '/dashboard.html';
  }
}