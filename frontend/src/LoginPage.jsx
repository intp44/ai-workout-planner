import './styles.css';

const BACKEND_URL = 'http://localhost:8080';

export default function LoginPage() {
  return (
    <div className="page-container">
      <div className="card">
        <h1>AI Walkout</h1>
        <p>Google 계정으로 로그인하여 맞춤형 루틴을 받아보세요.</p>
        <a className="login-button" href={`${BACKEND_URL}/oauth2/authorization/google`}>
          Google 로그인
        </a>
      </div>
    </div>
  );
}
