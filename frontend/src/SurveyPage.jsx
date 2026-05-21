import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, saveSurvey, getSurvey } from './api';

const initialForm = {
  age: '',
  gender: '',
  heightCm: '',
  weightKg: '',
  goal: '',
  experienceLevel: '',
  equipment: '',
};

export default function SurveyPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    getSurvey(token)
      .then((survey) => {
        if (survey) {
          navigate('/', { replace: true });
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [navigate]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && (!form.age || !form.gender)) {
      setError('나이와 성별을 선택해주세요.');
      return;
    }
    if (step === 2 && (!form.heightCm || !form.weightKg)) {
      setError('키와 몸무게를 입력해주세요.');
      return;
    }
    if (step === 3 && (!form.goal || !form.experienceLevel || !form.equipment)) {
      setError('모든 질문에 응답해주세요.');
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setError('');
    const token = getAuthToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      await saveSurvey(token, {
        age: Number(form.age),
        gender: form.gender,
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        goal: form.goal,
        experienceLevel: form.experienceLevel,
        equipment: form.equipment,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError('설문 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">
          <h1>설문 확인 중...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <h1>맞춤형 운동 설문</h1>
        <p>{step} / 3 단계</p>
        {error && <p className="error">{error}</p>}

        {step === 1 && (
          <div className="survey-step">
            <label>
              나이
              <input
                type="number"
                value={form.age}
                onChange={(event) => updateField('age', event.target.value)}
                min="14"
              />
            </label>
            <label>
              성별
              <select value={form.gender} onChange={(event) => updateField('gender', event.target.value)}>
                <option value="">선택</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="survey-step">
            <label>
              키 (cm)
              <input
                type="number"
                value={form.heightCm}
                onChange={(event) => updateField('heightCm', event.target.value)}
                min="100"
              />
            </label>
            <label>
              몸무게 (kg)
              <input
                type="number"
                value={form.weightKg}
                onChange={(event) => updateField('weightKg', event.target.value)}
                min="30"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="survey-step">
            <label>
              운동 목표
              <select value={form.goal} onChange={(event) => updateField('goal', event.target.value)}>
                <option value="">선택</option>
                <option value="diet">다이어트</option>
                <option value="hypertrophy">근비대</option>
                <option value="fitness">체력향상</option>
              </select>
            </label>
            <label>
              운동 경험
              <select
                value={form.experienceLevel}
                onChange={(event) => updateField('experienceLevel', event.target.value)}
              >
                <option value="">선택</option>
                <option value="none">없음</option>
                <option value="beginner">초보</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
            </label>
            <label>
              보유 기구
              <select value={form.equipment} onChange={(event) => updateField('equipment', event.target.value)}>
                <option value="">선택</option>
                <option value="gym">헬스장</option>
                <option value="home_gym">홈짐</option>
                <option value="none">없음</option>
              </select>
            </label>
          </div>
        )}

        <button className="login-button" onClick={handleNext}>
          {step < 3 ? '다음' : '제출'}
        </button>
      </div>
    </div>
  );
}
