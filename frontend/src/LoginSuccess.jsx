import { useEffect } from 'react';
import { setAuthToken } from './api';

export default function LoginSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      setAuthToken(token);
      window.location.replace('/');
    } else {
      window.location.replace('/login');
    }
  }, []);

  return (
    <div className="page-container">
      <div className="card">
        <h1>로그인 중...</h1>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
