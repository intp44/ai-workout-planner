import { useEffect, useMemo, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  getAuthToken,
  saveWorkout,
  getMyWorkouts,
  getWorkoutStats,
  saveInBody,
  getMyInBody,
} from './api';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const initialWorkoutForm = {
  exerciseName: '',
  sets: 3,
  weightKg: 0,
  reps: 10,
  workoutDate: new Date().toISOString().slice(0, 10),
};

const initialInBodyForm = {
  recordDate: new Date().toISOString().slice(0, 10),
  bodyFatPercent: '',
  muscleMass: '',
  weightKg: '',
};

// ── 달력 컴포넌트 ──────────────────────────────────
function WorkoutCalendar({ records }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const workoutDays = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      const d = r.workoutDate?.toString().slice(0, 10);
      if (d) set.add(d);
    });
    return set;
  }, [records]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pad = (n) => String(n).padStart(2, '0');
  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  return (
    <div className="calendar-wrap">
      <div className="calendar-header">
        <button className="cal-nav" onClick={prevMonth}>‹</button>
        <span className="cal-title">{year}년 {MONTHS[month]}</span>
        <button className="cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="calendar-grid">
        {WEEKDAYS.map((d) => <div key={d} className="cal-weekday">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
          const hasWorkout = workoutDays.has(dateStr);
          const isToday = dateStr === today;
          return (
            <div
              key={dateStr}
              className={`cal-day ${hasWorkout ? 'cal-day--workout' : ''} ${isToday ? 'cal-day--today' : ''}`}
            >
              {day}
              {hasWorkout && <span className="cal-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────
export default function WorkoutPage() {
  const [workoutForm, setWorkoutForm] = useState(initialWorkoutForm);
  const [inBodyForm, setInBodyForm] = useState(initialInBodyForm);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [inBodyRecords, setInBodyRecords] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inBodyError, setInBodyError] = useState('');
  const [inBodySuccess, setInBodySuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('workout'); // 'workout' | 'inbody'

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    Promise.all([getMyWorkouts(token), getWorkoutStats(token), getMyInBody(token)])
      .then(([workouts, statsData, inbody]) => {
        setRecords(workouts || []);
        setStats(statsData);
        setInBodyRecords(inbody || []);
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'));
  }, []);

  // ── 운동 기록 저장 ─────────────────────────────
  const handleSaveWorkout = async () => {
    setError(''); setSuccess('');
    const token = getAuthToken();
    if (!token) { setError('로그인이 필요합니다.'); return; }
    setLoading(true);
    try {
      await saveWorkout(token, {
        exerciseName: workoutForm.exerciseName,
        sets: Number(workoutForm.sets),
        weightKg: Number(workoutForm.weightKg),
        reps: Number(workoutForm.reps),
        workoutDate: workoutForm.workoutDate,
      });
      setSuccess('운동 기록이 저장되었습니다.');
      setWorkoutForm(initialWorkoutForm);
      const [workouts, statsData] = await Promise.all([getMyWorkouts(token), getWorkoutStats(token)]);
      setRecords(workouts || []);
      setStats(statsData);
    } catch {
      setError('기록 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ── 인바디 기록 저장 ───────────────────────────
  const handleSaveInBody = async () => {
    setInBodyError(''); setInBodySuccess('');
    const token = getAuthToken();
    if (!token) { setInBodyError('로그인이 필요합니다.'); return; }
    setLoading(true);
    try {
      await saveInBody(token, {
        recordDate: inBodyForm.recordDate,
        bodyFatPercent: inBodyForm.bodyFatPercent !== '' ? Number(inBodyForm.bodyFatPercent) : null,
        muscleMass: inBodyForm.muscleMass !== '' ? Number(inBodyForm.muscleMass) : null,
        weightKg: inBodyForm.weightKg !== '' ? Number(inBodyForm.weightKg) : null,
      });
      setInBodySuccess('인바디 기록이 저장되었습니다.');
      setInBodyForm(initialInBodyForm);
      const inbody = await getMyInBody(token);
      setInBodyRecords(inbody || []);
    } catch {
      setInBodyError('인바디 기록 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ── 차트 데이터 ────────────────────────────────
  const weeklyChartData = useMemo(() => ({
    labels: stats?.weeklyStats?.map((i) => i.date) || [],
    datasets: [{
      label: '운동 횟수',
      data: stats?.weeklyStats?.map((i) => i.count) || [],
      backgroundColor: '#1a73e8',
    }],
  }), [stats]);

  const selectedExercise = useMemo(() => stats?.exerciseWeightTrends?.[0], [stats]);

  const weightTrendData = useMemo(() => ({
    labels: selectedExercise?.entries?.map((e) => e.date) || [],
    datasets: [{
      label: selectedExercise?.exerciseName || '중량',
      data: selectedExercise?.entries?.map((e) => e.weightKg || 0) || [],
      borderColor: '#1a73e8',
      backgroundColor: 'rgba(26,115,232,0.15)',
      tension: 0.3,
    }],
  }), [selectedExercise]);

  const inBodyChartData = useMemo(() => ({
    labels: inBodyRecords.map((r) => r.recordDate),
    datasets: [
      {
        label: '체지방률 (%)',
        data: inBodyRecords.map((r) => r.bodyFatPercent),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.15)',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: '근육량 (kg)',
        data: inBodyRecords.map((r) => r.muscleMass),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.15)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  }), [inBodyRecords]);

  const inBodyChartOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: true } },
    scales: {
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: '체지방률 (%)' } },
      y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: '근육량 (kg)' }, grid: { drawOnChartArea: false } },
    },
  };

  return (
    <div className="page-container workout-page-container">
      <div className="card workout-card">
        <h1>운동 기록</h1>

        {/* 탭 */}
        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === 'workout' ? 'tab-btn--active' : ''}`} onClick={() => setActiveTab('workout')}>🏋️ 운동 기록</button>
          <button className={`tab-btn ${activeTab === 'inbody' ? 'tab-btn--active' : ''}`} onClick={() => setActiveTab('inbody')}>📊 인바디</button>
        </div>

        {/* ── 운동 기록 탭 ── */}
        {activeTab === 'workout' && (
          <>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <div className="workout-form">
              <label>운동명<input type="text" value={workoutForm.exerciseName} onChange={(e) => setWorkoutForm(p => ({ ...p, exerciseName: e.target.value }))} /></label>
              <label>세트<input type="number" min="1" value={workoutForm.sets} onChange={(e) => setWorkoutForm(p => ({ ...p, sets: e.target.value }))} /></label>
              <label>중량(kg)<input type="number" min="0" value={workoutForm.weightKg} onChange={(e) => setWorkoutForm(p => ({ ...p, weightKg: e.target.value }))} /></label>
              <label>반복 횟수<input type="number" min="1" value={workoutForm.reps} onChange={(e) => setWorkoutForm(p => ({ ...p, reps: e.target.value }))} /></label>
              <label>날짜<input type="date" value={workoutForm.workoutDate} onChange={(e) => setWorkoutForm(p => ({ ...p, workoutDate: e.target.value }))} /></label>
              <button className="login-button" onClick={handleSaveWorkout} disabled={loading}>기록 저장</button>
            </div>

            {/* 달력 */}
            <h2>운동 히스토리</h2>
            <WorkoutCalendar records={records} />

            {/* 주간 차트 */}
            {stats && (
              <div className="chart-block">
                <h2>주간 운동 횟수</h2>
                <Bar data={weeklyChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            )}

            {/* 중량 추이 */}
            {selectedExercise && (
              <div className="chart-block">
                <h2>{selectedExercise.exerciseName} 중량 변화</h2>
                <Line data={weightTrendData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
              </div>
            )}

            {/* 최근 기록 테이블 */}
            <div className="record-list">
              <h2>최근 기록</h2>
              {records.length === 0 ? <p>아직 기록이 없습니다.</p> : (
                <table>
                  <thead><tr><th>날짜</th><th>운동명</th><th>세트</th><th>중량</th><th>횟수</th></tr></thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id}>
                        <td>{r.workoutDate}</td>
                        <td>{r.exerciseName}</td>
                        <td>{r.sets}</td>
                        <td>{r.weightKg ?? '-'}</td>
                        <td>{r.reps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── 인바디 탭 ── */}
        {activeTab === 'inbody' && (
          <>
            {inBodyError && <p className="error">{inBodyError}</p>}
            {inBodySuccess && <p className="success">{inBodySuccess}</p>}

            <div className="workout-form">
              <label>날짜<input type="date" value={inBodyForm.recordDate} onChange={(e) => setInBodyForm(p => ({ ...p, recordDate: e.target.value }))} /></label>
              <label>체지방률 (%)<input type="number" min="0" step="0.1" value={inBodyForm.bodyFatPercent} onChange={(e) => setInBodyForm(p => ({ ...p, bodyFatPercent: e.target.value }))} /></label>
              <label>근육량 (kg)<input type="number" min="0" step="0.1" value={inBodyForm.muscleMass} onChange={(e) => setInBodyForm(p => ({ ...p, muscleMass: e.target.value }))} /></label>
              <label>체중 (kg)<input type="number" min="0" step="0.1" value={inBodyForm.weightKg} onChange={(e) => setInBodyForm(p => ({ ...p, weightKg: e.target.value }))} /></label>
              <button className="login-button" onClick={handleSaveInBody} disabled={loading}>인바디 저장</button>
            </div>

            {inBodyRecords.length === 0 ? (
              <div className="inbody-empty">
                <p>📋 인바디 데이터가 없습니다.</p>
                <p>위 폼에 체성분 정보를 입력하면 변화 추이 그래프가 표시됩니다.</p>
              </div>
            ) : (
              <>
                <div className="chart-block">
                  <h2>체성분 변화 추이</h2>
                  <Line data={inBodyChartData} options={inBodyChartOptions} />
                </div>

                <div className="record-list">
                  <h2>인바디 기록</h2>
                  <table>
                    <thead><tr><th>날짜</th><th>체지방률(%)</th><th>근육량(kg)</th><th>체중(kg)</th></tr></thead>
                    <tbody>
                      {[...inBodyRecords].reverse().map((r) => (
                        <tr key={r.id}>
                          <td>{r.recordDate}</td>
                          <td>{r.bodyFatPercent ?? '-'}</td>
                          <td>{r.muscleMass ?? '-'}</td>
                          <td>{r.weightKg ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
