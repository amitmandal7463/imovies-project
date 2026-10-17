import { useState } from "react";
import { formatPrice } from "../utils/currency";

function MoviePoster({ movie }) {
  const [failed, setFailed] = useState(false);

  if (!movie.posterUrl || failed) {
    return (
      <img
        className="poster poster-fallback"
        src="/am-logo.png"
        alt={`${movie.title} poster unavailable`}
      />
    );
  }

  return (
    <img
      className="poster"
      src={movie.posterUrl}
      alt={`${movie.title} poster`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function MovieCard({
  movie,
  selected,
  deleting,
  canManageMovies,
  authLoading,
  onSelect,
  onDelete,
  onBook,
}) {
  return (
    <article className={`movie-card${selected ? " selected" : ""}`}>
      <button
        className="movie-card-select"
        type="button"
        onClick={() => onSelect(movie._id)}
        aria-pressed={selected}
        aria-label={`Select ${movie.title}`}
      >
        <MoviePoster
          key={movie.posterUrl || "fallback"}
          movie={movie}
        />
        <span className="movie-info">
          <strong>{movie.title}</strong>
          <span>
            {movie.genre}
            {movie.releaseYear ? ` · ${movie.releaseYear}` : ""}
          </span>
          <span>{movie.durationMinutes} min</span>
          <span className="movie-price">{formatPrice(movie.price)} / ticket</span>
        </span>
      </button>
      <button
        className="book-ticket-button"
        type="button"
        disabled={authLoading}
        onClick={() => onBook(movie._id)}
      >
        Book Ticket
      </button>
      {canManageMovies ? (
        <button
          className="delete-movie-button"
          type="button"
          disabled={deleting}
          onClick={() => onDelete(movie)}
          aria-label={`Delete ${movie.title}`}
        >
          {deleting ? "Deleting…" : "Delete Movie"}
        </button>
      ) : null}
    </article>
  );
}

export default MovieCard;
