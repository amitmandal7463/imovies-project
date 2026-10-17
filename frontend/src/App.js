import { useEffect, useMemo, useState } from "react";
import AddMovieForm from "./components/AddMovieForm";
import AuthModal from "./components/AuthModal";
import BookingForm from "./components/BookingForm";
import MovieGrid from "./components/MovieGrid";
import {
  deleteMovie,
  getCurrentUser,
  getMovies,
  logoutUser,
} from "./services/api";
import "./index.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [addMovieOpen, setAddMovieOpen] = useState(false);
  const [deletingMovieId, setDeletingMovieId] = useState("");
  const [managementMessage, setManagementMessage] = useState("");
  const [managementError, setManagementError] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [bookingFocusRequest, setBookingFocusRequest] = useState(0);
  const [resumePaymentRequest, setResumePaymentRequest] = useState(0);
  const [authResumeAction, setAuthResumeAction] = useState(null);
  const canManageMovies = user?.role === "admin" || user?.role === "owner";

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((result) => {
        if (active) {
          setUser(result.user);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setManagementError("Could not check your login status. You can still browse movies.");
        }
      })
      .finally(() => {
        if (active) {
          setAuthLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMovies() {
      setLoading(true);
      setError("");
      try {
        const result = await getMovies({ signal: controller.signal });
        setMovies(result);
        setSelectedMovieId((current) =>
          result.some((movie) => movie._id === current) ? current : ""
        );
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMovies();
    return () => controller.abort();
  }, [reload]);

  const genres = useMemo(
    () => [...new Set(movies.map((movie) => movie.genre).filter(Boolean))].sort(),
    [movies]
  );
  const visibleMovies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return movies.filter((movie) => {
      const matchesGenre = !genre || movie.genre === genre;
      const matchesSearch =
        !query ||
        [movie.title, movie.genre, movie.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      return matchesGenre && matchesSearch;
    });
  }, [genre, movies, search]);

  function handleMovieAdded(createdMovie) {
    if (!canManageMovies) {
      setManagementError("You do not have permission to manage movies.");
      return;
    }
    setMovies((current) =>
      [...current, createdMovie].sort((first, second) =>
          first.title.localeCompare(second.title)
      )
    );
    setSelectedMovieId(createdMovie._id);
    setGenre("");
    setSearch("");
    setAddMovieOpen(false);
    setManagementError("");
    setManagementMessage(`${createdMovie.title} was added to the movie list.`);
  }

  function handleBookMovie(movieId) {
    setSelectedMovieId(movieId);
    setProfileMenuOpen(false);
    if (!user) {
      setAuthResumeAction("booking");
      setAuthModalOpen(true);
      return;
    }
    setAuthResumeAction(null);
    setBookingFocusRequest((request) => request + 1);
    document.querySelector(".booking-form")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function handleAuthenticated(authenticatedUser) {
    setUser(authenticatedUser);
    setAuthModalOpen(false);
    const resumeAction = authResumeAction;
    setAuthResumeAction(null);
    if (resumeAction) {
      if (resumeAction === "payment") {
        setResumePaymentRequest((request) => request + 1);
      } else {
        setBookingFocusRequest((request) => request + 1);
      }
      window.setTimeout(() => {
        document.querySelector(".booking-form")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 0);
    }
  }

  async function handleLogout() {
    setManagementError("");
    try {
      await logoutUser();
      setUser(null);
      setManagementMessage("You’ve been logged out.");
    } catch (logoutError) {
      setManagementError(logoutError.message);
    }
  }

  async function handleMovieDelete(movie) {
    if (!canManageMovies) {
      setManagementError("You do not have permission to manage movies.");
      return;
    }
    if (!window.confirm(`Delete "${movie.title}" from the movie list?`)) {
      return;
    }

    setDeletingMovieId(movie._id);
    setManagementMessage("");
    setManagementError("");
    try {
      await deleteMovie(movie._id);
      setMovies((current) => current.filter((item) => item._id !== movie._id));
      setSelectedMovieId((current) => current === movie._id ? "" : current);
      setManagementMessage(`${movie.title} was deleted.`);
    } catch (requestError) {
      setManagementError(requestError.message);
    } finally {
      setDeletingMovieId("");
    }
  }

  return (
    <main className="page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="iMovies home">
          <img
            src="/am-logo.png"
            alt=""
            aria-hidden="true"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #00e676",
            }}
          />
          <span>iMovies</span>
        </a>
        <div className="header-actions">
          <span className="header-note">Your next movie night starts here</span>
          <div className={`profile-menu-wrap${profileMenuOpen ? " menu-open" : ""}`}>
            <button
              aria-expanded={profileMenuOpen}
              aria-haspopup={user ? "menu" : undefined}
              aria-label={user ? `Account menu for ${user.name}` : "Log in or sign up"}
              className={`profile-trigger${user ? " signed-in" : ""}`}
              disabled={authLoading}
              onClick={() => {
                if (user) {
                  setProfileMenuOpen((open) => !open);
                } else {
                  setAuthResumeAction(null);
                  setAuthModalOpen(true);
                }
              }}
              type="button"
            >
              {user ? (
                <>
                  <span className="profile-avatar" aria-hidden="true">
                    {user.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="profile-trigger-name">{user.name}</span>
                  <svg aria-hidden="true" className="profile-chevron" viewBox="0 0 16 16">
                    <path d="m4 6 4 4 4-4" />
                  </svg>
                </>
              ) : (
                <svg aria-hidden="true" className="profile-icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c.6-3.4 3.2-5.5 7-5.5s6.4 2.1 7 5.5" />
                </svg>
              )}
            </button>
            {user && profileMenuOpen ? (
              <>
                <button
                  aria-label="Close account menu"
                  className="profile-menu-dismiss"
                  onClick={() => setProfileMenuOpen(false)}
                  tabIndex="-1"
                  type="button"
                />
                <div className="profile-dropdown" role="menu">
                  <div className="profile-dropdown-user">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <button
                    className="profile-logout"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    role="menuitem"
                    type="button"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">THE BIG SCREEN IS CALLING</p>
        <h1>Make it a movie night.</h1>
        <p className="hero-copy">
          Find your next favorite and save your seats in just a few clicks.
        </p>
      </section>

      <section className="booking-layout" aria-label="Movie booking">
        <div className="movie-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NOW SHOWING</p>
              <h2>Pick your picture</h2>
            </div>
            <div className="catalogue-actions">
              {canManageMovies ? (
                <button
                  className="add-movie-toggle"
                  type="button"
                  aria-expanded={addMovieOpen}
                  onClick={() => {
                    setAddMovieOpen((open) => !open);
                    setManagementError("");
                  }}
                >
                  {addMovieOpen ? "Close" : "+ Add Movie"}
                </button>
              ) : null}
              <span className="film-icon" aria-hidden="true">▶</span>
            </div>
          </div>

          <div className="movie-filters">
            <label className="search-field">
              <span className="visually-hidden">Search movies</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search titles and genres"
              />
            </label>
            <label className="genre-field">
              <span className="visually-hidden">Filter by genre</span>
              <select value={genre} onChange={(event) => setGenre(event.target.value)}>
                <option value="">All genres</option>
                {genres.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>

          {canManageMovies && addMovieOpen ? (
            <AddMovieForm
              onMovieAdded={handleMovieAdded}
              onCancel={() => setAddMovieOpen(false)}
            />
          ) : null}
          {managementError ? (
            <p className="feedback error" role="alert">{managementError}</p>
          ) : null}
          {managementMessage ? (
            <p className="feedback success" role="status">{managementMessage}</p>
          ) : null}

          {loading ? (
            <p className="status" role="status">Loading movies…</p>
          ) : error ? (
            <div className="empty-state" role="alert">
              <h3>Movies couldn’t be loaded</h3>
              <p>{error}</p>
              <button
                className="retry-button"
                type="button"
                onClick={() => setReload((value) => value + 1)}
              >
                Try again
              </button>
            </div>
          ) : movies.length === 0 ? (
            <div className="empty-state">
              <span aria-hidden="true">🍿</span>
              <h3>No movies just yet</h3>
              <p>Check back soon for what’s playing.</p>
            </div>
          ) : (
            <MovieGrid
              movies={visibleMovies}
              selectedMovieId={selectedMovieId}
              deletingMovieId={deletingMovieId}
              canManageMovies={canManageMovies}
              authLoading={authLoading}
              onSelect={setSelectedMovieId}
              onDelete={handleMovieDelete}
              onBook={handleBookMovie}
            />
          )}
        </div>

        <BookingForm
          movies={movies}
          selectedMovieId={selectedMovieId}
          onMovieChange={setSelectedMovieId}
          user={user}
          authLoading={authLoading}
          focusRequest={bookingFocusRequest}
          resumePaymentRequest={resumePaymentRequest}
          onAuthRequired={() => {
            setAuthResumeAction("payment");
            setAuthModalOpen(true);
          }}
        />
      </section>

      <footer>© {new Date().getFullYear()} iMovies. Your seat is waiting.</footer>
      {authModalOpen ? (
        <AuthModal
          onAuthenticated={handleAuthenticated}
          onClose={() => {
            setAuthModalOpen(false);
            setAuthResumeAction(null);
          }}
        />
      ) : null}
    </main>
  );
}

export default App;
