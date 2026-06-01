import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getRoutine, getRoutineWithCondition } from './api';
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
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

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
      setShowConditionForm(false);
    } catch (err) {
      setError('루틴 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const getConditionMessage = () => {
    if (currentCondition?.level === 'bad') {
      return '⚠️ 컨디션이 나쁘므로 오늘은 가벼운 스트레칭과 회복 운동 위주로 진행하세요.';
    }
    return null;
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
