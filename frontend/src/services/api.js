const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");

function buildApiUrl(path) {
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}

async function request(path, options = {}) {
  const url = buildApiUrl(path);
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json") && !contentType.includes("+json")) {
    throw new Error(
      `Expected a JSON response from ${url}, but received ${contentType || "an unknown content type"} (HTTP ${response.status}).`
    );
  }
  const result = await response.json();

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

export function getBookings({ signal } = {}) {
  return request("/api/bookings", { signal });
}

export { API_URL };
