import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clearAuthToken, getAuthToken, API_BASE_URL, getMyWorkouts } from './api';
import { getMotivationMessage, getDaysSinceLastWorkout } from './motivationMessages';

export default function MainPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [motivationMsg, setMotivationMsg] = useState('');

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
      getMyWorkouts(token).catch(() => null),
    ])
      .then(([userData, workouts]) => {
        setUser(userData);
        const daysSince = getDaysSinceLastWorkout(workouts);
        if (daysSince === null || daysSince >= 7) {
          setMotivationMsg(getMotivationMessage(userData?.name || '회원', daysSince));
        }
      })
      .catch((err) => setError(err.message || '사용자 정보를 가져오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = '/login';
  };

  const displayName = user?.name || '사용자';

  return (
    <div className="page-container">
      <div className="card">
        <h1>AI Workout</h1>
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
            {motivationMsg && (
              <p className="motivation-banner">{motivationMsg}</p>
            )}
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
              <button className="secondary-button" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
