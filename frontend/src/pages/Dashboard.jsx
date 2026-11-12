import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import FeedbackState from "../components/FeedbackState";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date pending"
    : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

const prizeLabel = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(value ?? 0);

const TournamentMetrics = ({ tournament }) => (
  <div className="home-tournament-meta dashboard-tournament-meta">
    <span><small>Prize</small><strong>{prizeLabel(tournament.prize)}</strong></span>
    <span><small>Entrants</small><strong>{tournament.registeredCount ?? tournament.registeredPlayers?.length ?? 0} / {tournament.maxPlayers ?? "Open"}</strong></span>
    <span><small>Team size</small><strong>{tournament.playersPerTeam ? `${tournament.playersPerTeam} players` : "Not set"}</strong></span>
  </div>
);

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [state, setState] = useState(() => localStorage.getItem("token") ? "loading" : "signed-out");
  const [actionMessage, setActionMessage] = useState("");

  const load = () => {
    if (!localStorage.getItem("token")) {
      setState("signed-out");
      return;
    }
    Promise.all([api.get("/auth/me"), api.get("/tournaments")])
      .then(([profile, response]) => {
        const currentUser = profile.data;
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
        setTournaments(Array.isArray(response.data) ? response.data : []);
        setState("ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(() => {
    load();
  }, []);

  const retryLoad = () => {
    setState("loading");
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      try {
        await api.delete(`/tournaments/${id}`);
        setTournaments((current) => current.filter((item) => item._id !== id));
        setActionMessage("Tournament deleted successfully.");
      } catch {
        setActionMessage("Failed to delete tournament.");
      }
    }
  };

  const handleUnregister = async (id) => {
    try {
      const { data } = await api.post(`/tournaments/${id}/unregister`);
      setTournaments((current) => current.map((item) => item._id === id ? data.tournament : item));
      setActionMessage("Successfully unregistered from tournament.");
    } catch {
      setActionMessage("Failed to unregister.");
    }
  };

  if (state === "loading") {
    return <div className="content-width page-content"><PageHeader eyebrow="DASHBOARD" title="Your dashboard" /><FeedbackState title="Loading your dashboard">Getting your details.</FeedbackState></div>;
  }

  if (state === "signed-out" || !user) {
    return (
      <div className="content-width page-content">
        <PageHeader eyebrow="DASHBOARD" title="Your dashboard" />
        <FeedbackState title="Sign in to see your space" action={<Link className="button" to="/login">Sign in</Link>}>
          Your tournament registrations are tied to your account.
        </FeedbackState>
      </div>
    );
  }

  if (state === "error") {
    return <div className="content-width page-content"><PageHeader eyebrow="DASHBOARD" title="Your dashboard" /><FeedbackState title="We couldn't load your account" tone="error" action={<button className="button button-outline" onClick={retryLoad}>Try again</button>}>Check your connection.</FeedbackState></div>;
  }

  const owned = tournaments.filter((tournament) =>
    String(tournament.organizer?._id || tournament.organizer || "") === String(user._id)
  );

  const joined = tournaments.filter((tournament) =>
    tournament.registeredPlayers?.some((player) =>
      String(player?._id || player) === String(user._id)
    )
  );

  return (
    <div className="content-width page-content">
      <PageHeader
        eyebrow={user?.role === "organizer" ? "ORGANIZER WORKSPACE" : "PLAYER SPACE"}
        title={`Good to see you, ${user?.username || "player"}.`}
        description={user?.role === "organizer" ? "Your tournament listings and activity." : "Your competitions and registrations."}
        actions={user?.role === "organizer"
          ? <Link className="button" to="/tournaments?create=1">＋ Create tournament</Link>
          : <Link className="button button-outline" to="/tournaments">Find a tournament <span aria-hidden="true">↗</span></Link>}
      />

      {actionMessage && <p className="inline-notice" role="status" style={{ margin: "1rem 0", color: "#ff6600" }}>{actionMessage}</p>}

      <section className="profile-strip">
        <div className="profile-initial">{(user?.username || "P").slice(0, 1).toUpperCase()}</div>
        <div className="profile-id">
          <span className="eyebrow">ACCOUNT</span>
          <strong>{user?.username}</strong>
          <span>{user?.email}</span>
        </div>
        <div className="profile-role">
          <span>Account type</span>
          <strong>{user?.role || "Player"}</strong>
        </div>
      </section>

      {user?.role === "organizer" && (
        <section className="content-section">
          <div className="section-title-row">
            <div><p className="eyebrow"><span className="eyebrow-line" /> Organizer tools</p><h2>Your tournament listings</h2></div>
            <span className="section-count">{owned.length} events</span>
          </div>
          {owned.length === 0 ? (
            <FeedbackState title="Your first event starts here" action={<Link className="button" to="/tournaments?create=1">Create tournament</Link>}>
              Publish an event to make it visible on the board.
            </FeedbackState>
          ) : (
            <div className="tournament-list">
              {owned.map((tournament, index) => (
                <article className="tournament-row" key={tournament._id}>
                  <span className="row-index">{String(index + 1).padStart(2, "0")}</span>
                  <div className="tournament-row-main">
                    <span className="row-overline">{tournament.game} <span>·</span> {tournament.status}</span>
                    <h3>{tournament.name}</h3>
                    <TournamentMetrics tournament={tournament} />
                  </div>
                  <div className="tournament-row-date"><span>Event date</span><strong>{formatDate(tournament.date)}</strong></div>
                  <button className="button button-outline button-small" style={{ color: '#ff4444', borderColor: '#ff4444' }} onClick={() => handleDelete(tournament._id)}>
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="content-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> YOUR ACTIVITY</p>
            <h2>Registered tournaments</h2>
          </div>
          <span className="section-count">{joined.length} entries</span>
        </div>
        {joined.length === 0 ? (
          <FeedbackState title="No registrations yet" action={<Link className="button" to="/tournaments">Browse tournaments</Link>}>
            You haven't registered for any tournaments yet.
          </FeedbackState>
        ) : (
          <div className="tournament-list">
            {joined.map((tournament, index) => (
              <article className="tournament-row" key={tournament._id}>
                <span className="row-index">{String(index + 1).padStart(2, "0")}</span>
                <div className="tournament-row-main">
                  <span className="row-overline">{tournament.game} <span>·</span> {tournament.status}</span>
                  <h3>{tournament.name}</h3>
                  <TournamentMetrics tournament={tournament} />
                </div>
                <div className="tournament-row-date"><span>Event date</span><strong>{formatDate(tournament.date)}</strong></div>
                <button className="button button-outline button-small" onClick={() => handleUnregister(tournament._id)}>
                  Cancel Registration
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}