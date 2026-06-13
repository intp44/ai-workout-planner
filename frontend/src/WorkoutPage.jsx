import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getAuthToken, saveWorkout, getMyWorkouts, getWorkoutStats, deleteWorkout } from './api';
import { getMotivationMessage, getDaysSinceLastWorkout } from './motivationMessages';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const initialForm = {
  exerciseName: '',
  sets: 3,
  weightKg: 0,
  reps: 10,
  workoutDate: new Date().toISOString().slice(0, 10),
};

export default function WorkoutPage() {
  const [form, setForm] = useState(initialForm);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState('');
  const [motivationMsg, setMotivationMsg] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    Promise.all([getMyWorkouts(token), getWorkoutStats(token)])
      .then(([workouts, statsData]) => {
        setRecords(workouts || []);
        setStats(statsData);
        if (statsData?.exerciseWeightTrends?.length > 0) {
          setSelectedExerciseName(statsData.exerciseWeightTrends[0].exerciseName);
        }
        const daysSince = getDaysSinceLastWorkout(workouts);
        if (daysSince === null || daysSince >= 7) {
          setMotivationMsg(getMotivationMessage('회원님', daysSince));
        }
      })
      .catch(() => setError('운동 기록을 불러오지 못했습니다.'));
  }, []);

  const [calendarDate, setCalendarDate] = useState(new Date());

  const prevMonth = () => setCalendarDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const { firstDay, daysInMonth } = useMemo(() => {
    const y = calendarDate.getFullYear();
    const m = calendarDate.getMonth();
    return {
      firstDay: new Date(y, m, 1).getDay(),
      daysInMonth: new Date(y, m + 1, 0).getDate(),
    };
  }, [calendarDate]);

  const workoutDaysInMonth = useMemo(() => {
    const y = calendarDate.getFullYear();
    const m = calendarDate.getMonth();
    const set = new Set();
    records.forEach((r) => {
      const [ry, rm, rd] = r.workoutDate.split('-').map(Number);
      if (ry === y && rm - 1 === m) set.add(rd);
    });
    return set;
  }, [records, calendarDate]);

  const selectedExercise = useMemo(() => {
    return stats?.exerciseWeightTrends?.find((e) => e.exerciseName === selectedExerciseName) || null;
  }, [stats, selectedExerciseName]);

  const weightTrendData = useMemo(() => {
    const labels = selectedExercise?.entries?.map((entry) => entry.date) || [];
    const values = selectedExercise?.entries?.map((entry) => entry.weightKg || 0) || [];
    return {
      labels,
      datasets: [
        {
          label: selectedExercise?.exerciseName || '운동 중량',
          data: values,
          borderColor: '#C6FF2E',
          backgroundColor: 'rgba(26, 115, 232, 0.2)',
          tension: 0.3,
        },
      ],
    };
  }, [selectedExercise]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (id) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      await deleteWorkout(token, id);
      const [workouts, statsData] = await Promise.all([getMyWorkouts(token), getWorkoutStats(token)]);
      setRecords(workouts || []);
      setStats(statsData);
      if (statsData?.exerciseWeightTrends?.length > 0) {
        setSelectedExerciseName((prev) =>
          statsData.exerciseWeightTrends.find((e) => e.exerciseName === prev)
            ? prev
            : statsData.exerciseWeightTrends[0].exerciseName
        );
      }
    } catch {
      setError('삭제에 실패했습니다.');
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    const token = getAuthToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      return;
    }

    try {
      const workout = {
        exerciseName: form.exerciseName,
        sets: Number(form.sets),
        weightKg: Number(form.weightKg),
        reps: Number(form.reps),
        workoutDate: form.workoutDate,
      };
      await saveWorkout(token, workout);
      setSuccess('운동 기록이 저장되었습니다.');
      setForm(initialForm);
      const [workouts, statsData] = await Promise.all([getMyWorkouts(token), getWorkoutStats(token)]);
      setRecords(workouts || []);
      setStats(statsData);
    } catch (err) {
      setError('기록 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="page-container">
      <div className="card workout-card">
        <h1>운동 기록</h1>
        {motivationMsg && <div className="motivation-banner">{motivationMsg}</div>}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="workout-form">
          <label>
            운동명
            <input
              type="text"
              value={form.exerciseName}
              onChange={(event) => handleChange('exerciseName', event.target.value)}
            />
          </label>
          <label>
            세트
            <input
              type="number"
              min="1"
              value={form.sets}
              onChange={(event) => handleChange('sets', event.target.value)}
            />
          </label>
          <label>
            중량(kg)
            <input
              type="number"
              min="0"
              value={form.weightKg}
              onChange={(event) => handleChange('weightKg', event.target.value)}
            />
          </label>
          <label>
            반복 횟수
            <input
              type="number"
              min="1"
              value={form.reps}
              onChange={(event) => handleChange('reps', event.target.value)}
            />
          </label>
          <label>
            날짜
            <input
              type="date"
              value={form.workoutDate}
              onChange={(event) => handleChange('workoutDate', event.target.value)}
            />
          </label>
          <button className="login-button" onClick={handleSave} disabled={loading}>
            기록 저장
          </button>
        </div>

        <div className="chart-block">
          <div className="calendar-header">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <h2>{calendarDate.getFullYear()}년 {calendarDate.getMonth() + 1}월</h2>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>
          <div className="calendar-grid">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} className="calendar-day calendar-day--empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const today = new Date();
              const isToday =
                today.getFullYear() === calendarDate.getFullYear() &&
                today.getMonth() === calendarDate.getMonth() &&
                today.getDate() === day;
              const hasWorkout = workoutDaysInMonth.has(day);
              return (
                <div
                  key={day}
                  className={`calendar-day${hasWorkout ? ' calendar-day--workout' : ''}${isToday ? ' calendar-day--today' : ''}`}
                >
                  <span className="cal-day-num">{day}</span>
                  {hasWorkout && <span className="cal-dot" />}
                </div>
              );
            })}
          </div>
        </div>

        {stats?.exerciseWeightTrends?.length > 0 && (
          <div className="chart-block">
            <div className="exercise-select-row">
              <h2>중량 변화</h2>
              <select
                className="exercise-select"
                value={selectedExerciseName}
                onChange={(e) => setSelectedExerciseName(e.target.value)}
              >
                {stats.exerciseWeightTrends.map((e) => (
                  <option key={e.exerciseName} value={e.exerciseName}>
                    {e.exerciseName}
                  </option>
                ))}
              </select>
            </div>
            {selectedExercise ? (
              <Line
                data={weightTrendData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true },
                  },
                }}
              />
            ) : (
              <p>기록된 데이터가 없습니다.</p>
            )}
          </div>
        )}

        <div className="record-list">
          <h2>최근 기록</h2>
          {records.length === 0 ? (
            <p>아직 기록이 없습니다.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>운동명</th>
                  <th>세트</th>
                  <th>중량(kg)</th>
                  <th>횟수</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.workoutDate}</td>
                    <td>{record.exerciseName}</td>
                    <td>{record.sets}</td>
                    <td>{record.weightKg ?? '-'}</td>
                    <td>{record.reps}</td>
                    <td>
                      <button
                        className="delete-record-btn"
                        onClick={() => handleDelete(record.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
