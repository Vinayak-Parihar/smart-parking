import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link to="/" className="landing-wordmark">
          <span className="landing-mark" aria-hidden="true">
            P
          </span>
          Smart Parking
        </Link>
        <Link to="/app" className="btn landing-nav-cta">
          Open App
        </Link>
      </nav>

      <header className="landing-hero">
        <div className="landing-hero-copy">
          <h1 className="landing-headline">
            Drive in. A space <em className="hl">finds</em> you.
          </h1>
          <p className="landing-subhead">
            A camera reads your plate at the gate and assigns a space before
            you've parked. Leave, and it's free for the next car — tracked
            live, zone by zone.
          </p>
          <div className="landing-actions">
            <Link to="/app" className="btn">
              Find a Spot
            </Link>
            <Link to="/map" className="btn secondary">
              View Parking Map
            </Link>
          </div>
        </div>

        <div className="landing-hero-art" aria-hidden="true">
          <div className="landing-blob">
            <span>P</span>
          </div>
          <div className="landing-note">No ticket machines. No guessing.</div>
        </div>
      </header>

      <main className="landing-features">
        <article className="feature-tile feature-tile--lead">
          <div className="feature-scan" aria-hidden="true">
            <span className="feature-scan-plate">MH12 AB1234</span>
            <span className="feature-scan-beam" />
          </div>
          <h2>Automatic plate recognition</h2>
          <p>
            Entry and exit cameras read the plate and allocate or release a
            space automatically — no ticket, no attendant queue.
          </p>
        </article>

        <article className="feature-tile">
          <span className="feature-tag">LIVE</span>
          <h2>Live occupancy</h2>
          <p>Every lot updates over a socket connection the moment a space fills or frees up.</p>
        </article>

        <article className="feature-tile">
          <span className="feature-tag">ZONES</span>
          <h2>Zone-based layout</h2>
          <p>Pick a zone first, then see exactly which lots inside it still have room.</p>
        </article>
      </main>

      <footer className="landing-footer">
        <p className="landing-footer-line">
          Park in seconds. Leave — it's already free for the next car.
        </p>
        <div className="landing-footer-meta">
          <span className="landing-wordmark landing-wordmark--small">
            <span className="landing-mark" aria-hidden="true">
              P
            </span>
            Smart Parking
          </span>
          <span className="muted">Built on ANPR + real-time occupancy tracking.</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
