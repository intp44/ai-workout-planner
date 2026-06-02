import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuthToken,
  getRoutine,
  getRoutineWithCondition,
  getExerciseReplacement,
  recommendRoutine,
  searchYoutube,
} from './api';
import './RoutinePage.css';

const TIRED_AREAS = [
  { id: 'upper_body', label: '상체' },
  { id: 'lower_body', label: '하체' },
  { id: 'shoulder', label: '어깨' },
  { id: 'arm', label: '팔' },
  { id: 'back', label: '등' },
  { id: 'chest', label: '가슴' },
  { id: 'leg', label: '다리' },
];

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
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [conditionLevel, setConditionLevel] = useState('good');
  const [selectedTiredAreas, setSelectedTiredAreas] = useState([]);
  const [conditionNotes, setConditionNotes] = useState('');
  const [currentCondition, setCurrentCondition] = useState(null);
  const [replacementData, setReplacementData] = useState({});
  const [replacementLoadingKey, setReplacementLoadingKey] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) { navigate('/login', { replace: true }); return; }

    setLoading(true);
    getRoutine(token)
      .then((data) => {
        if (data) {
          setRoutine(data.routine);
          setTip(data.tip);
          if (data.conditionLevel) {
            setCurrentCondition({
              level: data.conditionLevel,
              areas: data.tiredAreas,
            });
          }
        }
      })
      .catch(() => setError('루틴을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleTiredAreaChange = (area) => {
    setSelectedTiredAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleGenerateWithCondition = async () => {
    if (!conditionLevel) {
      setError('컨디션을 선택해주세요.');
      return;
    }

    const token = getAuthToken();
    if (!token) { navigate('/login', { replace: true }); return; }
    setError('');
    setLoading(true);
    try {
      const conditionData = {
        conditionLevel,
        tiredAreas: selectedTiredAreas,
        notes: conditionNotes,
      };

      const data = await getRoutineWithCondition(token, conditionData);
      setRoutine(data.routine);
      setTip(data.tip);
      setCurrentCondition({
        level: conditionLevel,
        areas: selectedTiredAreas,
      });
      setReplacementData({});
      setShowConditionForm(false);
    } catch (err) {
      setError('루틴 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReplacement = async (day, exerciseIndex, exerciseName, focus, replacementType) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const key = `${day}-${exerciseIndex}`;
    setReplacementLoadingKey(key);
    setReplacementData((prev) => ({
      ...prev,
      [key]: {
        loading: true,
        options: [],
        fallback: '',
      },
    }));

    try {
      const data = await getExerciseReplacement(token, {
        day,
        exerciseName,
        focus,
        replacementType,
      });

      setReplacementData((prev) => ({
        ...prev,
        [key]: {
          loading: false,
          options: data?.replacements || [],
          fallback: data?.fallback || '',
        },
      }));
    } catch (err) {
      setReplacementData((prev) => ({
        ...prev,
        [key]: {
          loading: false,
          options: [],
          fallback: '대체 운동을 찾지 못했습니다. 스트레칭 또는 인접 근육군 운동을 시도해보세요.',
        },
      }));
    } finally {
      setReplacementLoadingKey(null);
    }
  };

  const handleApplyReplacement = (day, exerciseIndex, replacement) => {
    setRoutine((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              exercises: item.exercises.map((exercise, index) =>
                index === exerciseIndex
                  ? {
                      ...exercise,
                      name: replacement.name || exercise.name,
                      sets: replacement.sets || exercise.sets,
                      reps: replacement.reps || exercise.reps,
                      rest: replacement.rest || exercise.rest,
                      note: replacement.note || exercise.note,
                    }
                  : exercise
              ),
            }
          : item
      )
    );

    const key = `${day}-${exerciseIndex}`;
    setReplacementData((prev) => ({ ...prev, [key]: { ...prev[key], applied: replacement.name } }));
  };

  const getConditionMessage = () => {
    if (currentCondition?.level === 'bad') {
      return '⚠️ 컨디션이 나쁘므로 오늘은 가벼운 스트레칭과 회복 운동 위주로 진행하세요.';
    }
    return null;
  };

  const handleRecommend = async () => {
    const token = getAuthToken();
    if (!token) { navigate('/login', { replace: true }); return; }
    setError('');
    setLoading(true);
    try {
      const data = await recommendRoutine(token);
      setRoutine(data.routine);
      setTip(data.tip);
      setCurrentCondition(null);
      setReplacementData({});
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

        {getConditionMessage() && (
          <div className="condition-warning">
            {getConditionMessage()}
          </div>
        )}

        {!showConditionForm ? (
          <div className="button-group">
            <button
              className="login-button"
              onClick={handleRecommend}
              disabled={loading}
            >
              {loading ? '추천 생성 중...' : '루틴 추천 받기'}
            </button>
            <button
              className="secondary-button"
              onClick={() => setShowConditionForm(true)}
              disabled={loading}
            >
              컨디션 입력으로 루틴 생성
            </button>
          </div>
        ) : (
          <div className="condition-form">
            <h2>오늘의 컨디션 입력</h2>

            <div className="form-section">
              <label>신체 컨디션</label>
              <div className="condition-buttons">
                <button
                  className={`condition-btn ${conditionLevel === 'good' ? 'active good' : ''}`}
                  onClick={() => setConditionLevel('good')}
                >
                  👍 좋음
                </button>
                <button
                  className={`condition-btn ${conditionLevel === 'medium' ? 'active medium' : ''}`}
                  onClick={() => setConditionLevel('medium')}
                >
                  🙂 보통
                </button>
                <button
                  className={`condition-btn ${conditionLevel === 'bad' ? 'active bad' : ''}`}
                  onClick={() => setConditionLevel('bad')}
                >
                  😩 나쁨
                </button>
              </div>
            </div>

            <div className="form-section">
              <label>피로한 부위 선택 (다중선택 가능)</label>
              <div className="tired-areas-grid">
                {TIRED_AREAS.map((area) => (
                  <label key={area.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedTiredAreas.includes(area.id)}
                      onChange={() => handleTiredAreaChange(area.id)}
                    />
                    <span>{area.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label htmlFor="notes">추가 메모 (선택)</label>
              <textarea
                id="notes"
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                placeholder="예: 어제 운동이 너무 힘들었어요"
                rows="3"
              />
            </div>

            <div className="form-buttons">
              <button
                className="login-button"
                onClick={handleGenerateWithCondition}
                disabled={loading}
              >
                {loading ? '생성 중...' : '루틴 생성'}
              </button>
              <button
                className="secondary-button"
                onClick={() => setShowConditionForm(false)}
                disabled={loading}
              >
                취소
              </button>
            </div>
          </div>
        )}

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
                      item.exercises.map((exercise, exerciseIndex) => {
                        const key = `${item.day}-${exerciseIndex}`;
                        const replacementInfo = replacementData[key] || {};
                        return (
                          <div key={exerciseIndex} className="exercise-item">
                            <p className="exercise-name">{exercise.name}</p>
                            <p>세트: {exercise.sets}</p>
                            <p>횟수: {exercise.reps}</p>
                            <p>휴식: {exercise.rest}</p>
                            <RestTimer restStr={exercise.rest} />
                            <YoutubeSection exerciseName={exercise.name} />

                            <div className="exercise-actions">
                              <button
                                className="replacement-action-button"
                                onClick={() => handleRequestReplacement(item.day, exerciseIndex, exercise.name, item.focus, 'no_equipment')}
                                disabled={replacementLoadingKey === key || loading}
                              >
                                기구 없음
                              </button>
                              <button
                                className="replacement-action-button"
                                onClick={() => handleRequestReplacement(item.day, exerciseIndex, exercise.name, item.focus, 'no_space')}
                                disabled={replacementLoadingKey === key || loading}
                              >
                                공간 없음
                              </button>
                            </div>

                            {replacementInfo.loading && <p className="replacement-loading">대체 운동을 찾는 중입니다...</p>}
                            {replacementInfo.options && replacementInfo.options.length > 0 && (
                              <div className="replacement-list">
                                <p className="replacement-title">추천 대체 운동</p>
                                {replacementInfo.options.map((replacement, replacementIndex) => (
                                  <div key={replacementIndex} className="replacement-card">
                                    <p className="exercise-name">{replacement.name}</p>
                                    {replacement.sets && <p>세트: {replacement.sets}</p>}
                                    {replacement.reps && <p>횟수: {replacement.reps}</p>}
                                    {replacement.rest && <p>휴식: {replacement.rest}</p>}
                                    {replacement.note && <p>설명: {replacement.note}</p>}
                                    <button
                                      className="replacement-apply-button"
                                      onClick={() => handleApplyReplacement(item.day, exerciseIndex, replacement)}
                                    >
                                      이 운동으로 교체
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {replacementInfo.fallback && !replacementInfo.loading && (!replacementInfo.options || replacementInfo.options.length === 0) && (
                              <div className="replacement-fallback">
                                <p>{replacementInfo.fallback}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
