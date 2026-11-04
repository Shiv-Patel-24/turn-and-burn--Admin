// Centralized API client for Turn & Burn Admin Portal

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://turn-and-burn-backend.onrender.com/api/v1";

export const getAuthToken = () => {
  return (
    localStorage.getItem("admin_access_token") ||
    localStorage.getItem("token") ||
    ""
  );
};

export const setAuthSession = (token, user) => {
  if (token) {
    localStorage.setItem("admin_access_token", token);
  }
  if (user) {
    localStorage.setItem("admin_user", JSON.stringify(user));
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_user");
};

export const getAuthUser = () => {
  const user = localStorage.getItem("admin_user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch (err) {
    return null;
  }
};

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  // Support custom timeout to avoid hanging indefinitely on slow SMTP / external tasks
  const timeoutMs = options.timeoutMs || 25000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        data?.message || `Request failed with status ${response.status}`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      const timeoutError = new Error("Request timed out. Please check your connection or retry.");
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export default apiRequest;
