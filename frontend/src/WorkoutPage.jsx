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
import { getAuthToken, saveWorkout, getMyWorkouts, getWorkoutStats } from './api';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

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

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    Promise.all([getMyWorkouts(token), getWorkoutStats(token)])
      .then(([workouts, statsData]) => {
        setRecords(workouts || []);
        setStats(statsData);
      })
      .catch(() => setError('운동 기록을 불러오지 못했습니다.'));
  }, []);

  const chartLabels = useMemo(() => {
    return stats?.weeklyStats?.map((item) => item.date) || [];
  }, [stats]);

  const workoutCounts = useMemo(() => {
    return stats?.weeklyStats?.map((item) => item.count) || [];
  }, [stats]);

  const selectedExercise = useMemo(() => {
    return stats?.exerciseWeightTrends?.[0];
  }, [stats]);

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

        {stats && (
          <div className="chart-block">
            <h2>주간 운동 횟수</h2>
            <Bar
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    label: '운동 횟수',
                    data: workoutCounts,
                    backgroundColor: '#C6FF2E',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        )}

        {selectedExercise && (
          <div className="chart-block">
            <h2>{selectedExercise.exerciseName} 중량 변화</h2>
            <Line
              data={weightTrendData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                },
              }}
            />
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
