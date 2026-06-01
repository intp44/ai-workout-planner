import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clearAuthToken, getAuthToken, getMyWorkouts, API_BASE_URL } from './api';
import { getMotivationMessage, getDaysSinceLastWorkout } from './motivationMessages';

export default function MainPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('로그인 정보가 없습니다. 다시 로그인해주세요.');
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (!res.ok) throw new Error('인증에 실패했습니다. 다시 로그인해주세요.');
        return res.json();
      }),
      getMyWorkouts(token).catch(() => []),
    ])
      .then(([userData, workouts]) => {
        setUser(userData);
        checkAndNotify(userData?.name || '회원', workouts);
      })
      .catch((err) => setError(err.message || '사용자 정보를 가져오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const checkAndNotify = (name, workouts) => {
    const sessionKey = 'motivation-notified';
    if (sessionStorage.getItem(sessionKey)) return;

    const daysSince = getDaysSinceLastWorkout(workouts);
    if (daysSince === 0) return;

    const message = getMotivationMessage(name, daysSince ?? '?');
    sessionStorage.setItem(sessionKey, '1');

    setToast(message);
    setTimeout(() => setToast(null), 8000);

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('AI Walkout 알림', { body: message, icon: '/favicon.ico' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification('AI Walkout 알림', { body: message, icon: '/favicon.ico' });
          }
        });
      }
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = '/login';
  };

  const displayName = user?.name || '사용자';

  return (
    <div className="page-container">
      {toast && (
        <div className="motivation-toast">
          <span className="toast-icon">💪</span>
          <span className="toast-message">{toast}</span>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className="card">
        <h1>AI Walkout</h1>
        {loading && <p>메인 화면을 로드 중입니다...</p>}
        {!loading && error && (
          <>
            <p className="error">{error}</p>
            <button className="login-button" onClick={handleLogout}>
              다시 로그인하기
            </button>
          </>
        )}
        {!loading && !error && user && (
          <>
            <p className="welcome">환영합니다, {displayName}님!</p>
            <p className="subtitle">오늘의 맞춤 운동 루틴을 지금 바로 확인해보세요.</p>
            <div className="actions">
              <Link className="login-button" to="/routine">
                운동 루틴 추천받기
              </Link>
              <Link className="secondary-button" to="/workout">
                운동 기록 관리하기
              </Link>
              <Link className="secondary-button" to="/inbody">
                인바디 관리
              </Link>
            </div>
            <button className="secondary-button" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        )}
      </div>
    </div>
  );
}
