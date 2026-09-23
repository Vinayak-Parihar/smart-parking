import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="landing-wordmark">
        <span className="landing-mark" aria-hidden="true">
          P
        </span>
        Smart Parking
      </Link>
    </header>
  );
}

export default Header;
