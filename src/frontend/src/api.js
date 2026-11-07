const API_BASE = "http://localhost:8080/api";

function getHeaders() {
  const token = localStorage.getItem("courseforge_token");
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: Failed request`);
  }

  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      localStorage.setItem("courseforge_token", data.token);
      localStorage.setItem("courseforge_user", JSON.stringify(data));
    }
    return data;
  },

  async register(payload) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (data.token) {
      localStorage.setItem("courseforge_token", data.token);
      localStorage.setItem("courseforge_user", JSON.stringify(data));
    }
    return data;
  },

  logout() {
    localStorage.removeItem("courseforge_token");
    localStorage.removeItem("courseforge_user");
  },

  getCurrentUser() {
    const stored = localStorage.getItem("courseforge_user");
    return stored ? JSON.parse(stored) : null;
  },

  async getMe() {
    return request("/auth/me");
  },

  // Courses & Selection
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
