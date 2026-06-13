import { useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css';

const HIDDEN_PATHS = ['/login', '/login/success'];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  return (
    <nav className="global-nav">
      <button className="nav-btn" onClick={() => navigate('/')}>🏠 홈</button>
      <button className="nav-btn nav-btn-back" onClick={() => window.history.back()}>← 뒤로가기</button>
    </nav>
  );
}
