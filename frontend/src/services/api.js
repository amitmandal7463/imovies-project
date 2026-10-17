const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const result = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(result?.message || `Request failed with status ${response.status}.`);
  }
  return result;
}

export function getMovies({ signal } = {}) {
  return request("/api/movies", { signal });
}

export function getCurrentUser() {
  return request("/api/auth/me");
}

export function registerUser(credentials) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function loginUser(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function logoutUser() {
  return request("/api/auth/logout", { method: "POST" });
}

export function createMovie(movie) {
  return request("/api/movies", {
    method: "POST",
    body: JSON.stringify(movie),
  });
}

export function deleteMovie(movieId) {
  return request(`/api/movies/${encodeURIComponent(movieId)}`, {
    method: "DELETE",
  });
}

export function createBooking(booking) {
  return request("/api/bookings", {
    method: "POST",
    body: JSON.stringify(booking),
  });
}

export { API_URL };
