import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getRoutine, recommendRoutine, searchYoutube } from './api';

function parseRestSeconds(restStr) {
  if (!restStr) return 60;
  let total = 0;
  const minMatch = restStr.match(/(\d+)분/);
  const secMatch = restStr.match(/(\d+)초/);
  if (minMatch) total += parseInt(minMatch[1]) * 60;
  if (secMatch) total += parseInt(secMatch[1]);
  if (total === 0) {
    const num = parseInt(restStr);
    if (!isNaN(num)) total = num;
  }
  return total || 60;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function RestTimer({ restStr }) {
  const total = parseRestSeconds(restStr);
  const [remaining, setRemaining] = useState(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('휴식 완료!', { body: '다음 세트를 시작하세요.' });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setRemaining(total);
    setRunning(true);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setRemaining(null);
  };

  const progress = remaining !== null ? ((total - remaining) / total) * 100 : 0;

  return (
    <div className="rest-timer">
      {remaining === null ? (
        <button className="timer-btn" onClick={start}>
          ⏱ 휴식 타이머 시작 ({restStr})
        </button>
      ) : (
        <div className="timer-display">
          <div className="timer-progress-bar">
            <div className="timer-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className={`timer-count ${remaining === 0 ? 'timer-done' : ''}`}>
            {remaining === 0 ? '✅ 휴식 완료!' : formatTime(remaining)}
          </span>
          <button className="timer-btn timer-stop" onClick={stop}>중지</button>
        </div>
      )}
    </div>
  );
}

function YoutubeSection({ exerciseName }) {
  const [videos, setVideos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleToggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (videos !== null) return;
    setLoading(true);
    try {
      const token = getAuthToken();
      const result = await searchYoutube(token, exerciseName);
      setVideos(result || []);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="youtube-section">
      <button className="youtube-btn" onClick={handleToggle}>
        {open ? '▲ 닫기' : '▶ 유튜브 사용법 보기'}
      </button>
      {open && (
        <div className="youtube-list">
          {loading && <p className="yt-loading">검색 중...</p>}
          {!loading && videos && videos.length === 0 && <p className="yt-loading">영상을 찾지 못했습니다.</p>}
          {!loading && videos && videos.map((v) => (
            <a
              key={v.videoId}
              href={`https://www.youtube.com/watch?v=${v.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="youtube-item"
            >
              <img src={v.thumbnail} alt={v.title} className="yt-thumbnail" />
              <span className="yt-title">{v.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoutinePage() {
  const [routine, setRoutine] = useState(null);
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) { navigate('/login', { replace: true }); return; }

    setLoading(true);
    getRoutine(token)
      .then((data) => { if (data) { setRoutine(data.routine); setTip(data.tip); } })
      .catch(() => setError('루틴을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleRecommend = async () => {
    const token = getAuthToken();
    if (!token) { navigate('/login', { replace: true }); return; }
    setError('');
    setLoading(true);
    try {
      const data = await recommendRoutine(token);
      setRoutine(data.routine);
      setTip(data.tip);
    } catch {
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
                          <RestTimer restStr={exercise.rest} />
                          <YoutubeSection exerciseName={exercise.name} />
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
