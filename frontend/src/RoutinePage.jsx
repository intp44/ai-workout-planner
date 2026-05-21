import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getRoutine, recommendRoutine } from './api';

export default function RoutinePage() {
  const [routine, setRoutine] = useState(null);
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    getRoutine(token)
      .then((data) => {
        if (data) {
          setRoutine(data.routine);
          setTip(data.tip);
        }
      })
      .catch(() => setError('루틴을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleRecommend = async () => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await recommendRoutine(token);
      setRoutine(data.routine);
      setTip(data.tip);
    } catch (err) {
      setError('루틴 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card routine-card">
        <h1>맞춤형 루틴 추천</h1>
        {error && <p className="error">{error}</p>}
        <button className="login-button" onClick={handleRecommend} disabled={loading}>
          {loading ? '추천 생성 중...' : '루틴 추천 받기'}
        </button>

        {loading && <div className="spinner" />}

        {routine && (
          <div className="routine-list">
            {Array.isArray(routine) && routine.length > 0 ? (
              routine.map((item, index) => (
                <div key={index} className="routine-card-item">
                  <h2>{item.day}</h2>
                  <p className="routine-focus">집중 부위: {item.focus}</p>
                  <div className="exercise-list">
                    {Array.isArray(item.exercises) &&
                      item.exercises.map((exercise, exerciseIndex) => (
                        <div key={exerciseIndex} className="exercise-item">
                          <p className="exercise-name">{exercise.name}</p>
                          <p>세트: {exercise.sets}</p>
                          <p>횟수: {exercise.reps}</p>
                          <p>휴식: {exercise.rest}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <p>추천된 루틴이 없습니다.</p>
            )}
          </div>
        )}

        {tip && <p className="tip">오늘의 조언: {tip}</p>}
      </div>
    </div>
  );
}
