const API_BASE = "/api";
const TOKEN_KEY = "uni_course_selection_token";
const USER_KEY = "uni_course_selection_user";
const LEGACY_TOKEN_KEY = "courseforge_token";
const LEGACY_USER_KEY = "courseforge_user";

function getHeaders() {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request(endpoint, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error("Cannot connect to the Uni Course Selection backend. Start the backend and try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with HTTP ${res.status}.`);
  }
  return data;
}

function saveSession(data) {
  if (!data.token) return;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data));
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export const api = {
  async login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password })
    });
    saveSession(data);
    return data;
  },

  async register(payload) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        name: payload.name.trim(),
        userNo: payload.userNo?.trim() || "",
        email: payload.email.trim().toLowerCase(),
        major: payload.major.trim()
      })
    });
    saveSession(data);
    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  },

  getCurrentUser() {
    const stored = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      this.logout();
      return null;
    }
  },

  async getMe() {
    return request("/auth/me");
  },

  async getDashboard() {
    return request("/student/dashboard");
  },

  async getAllCourses() {
    return request("/courses");
  },

  async enroll(courseId) {
    return request("/student/enroll", {
      method: "POST",
      body: JSON.stringify({ courseId })
    });
  },

  async drop(courseId) {
    return request("/student/drop", {
      method: "POST",
      body: JSON.stringify({ courseId })
    });
  },

  async getHistory() {
    return request("/student/history");
  }
};
