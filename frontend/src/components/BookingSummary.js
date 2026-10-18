import { formatPrice } from "../utils/currency";

function BookingSummary({ bookings, loading, error }) {
  return (
    <section className="booking-summary" aria-labelledby="booking-summary-title">
      <div className="booking-summary-heading">
        <div>
          <p className="eyebrow">YOUR ORDERS</p>
          <h2 id="booking-summary-title">Booking summary</h2>
        </div>
        <span className="booking-summary-count">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
        </span>
      </div>

      {loading ? (
        <p className="status" role="status">Loading your bookings…</p>
      ) : error ? (
        <p className="feedback error" role="alert">{error}</p>
      ) : bookings.length === 0 ? (
        <div className="booking-summary-empty">
          <h3>No bookings yet</h3>
          <p>Your confirmed movie tickets will appear here.</p>
        </div>
      ) : (
        <div className="booking-summary-list">
          {bookings.map((booking) => {
            const bookingDate = booking.createdAt
              ? new Date(booking.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "";
            return (
              <article className="booking-order-card" key={booking._id}>
                <div className="booking-order-title">
                  <div>
                    <p className="eyebrow">TICKET ORDER</p>
                    <h3>{booking.movie?.title || "Movie unavailable"}</h3>
                  </div>
                  <strong className="booking-order-total">{formatPrice(booking.totalPrice)}</strong>
                </div>
                <div className="booking-order-details">
                  <span>{booking.seats} {booking.seats === 1 ? "ticket" : "tickets"}</span>
                  <span>Showtime: {booking.showtime}</span>
                  {booking.movie?.genre ? <span>{booking.movie.genre}</span> : null}
                  {bookingDate ? <span>Booked {bookingDate}</span> : null}
                </div>
                <div className="booking-order-footer">
                  <span>Ticket price · {formatPrice(booking.ticketPrice)}</span>
                  <span className="booking-order-status">Confirmed</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default BookingSummary;
