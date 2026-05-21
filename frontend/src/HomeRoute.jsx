import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getSurvey } from './api';
import MainPage from './MainPage';

export default function HomeRoute() {
  const [loading, setLoading] = useState(true);
  const [hasSurvey, setHasSurvey] = useState(false);
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
          setHasSurvey(true);
        } else {
          navigate('/survey', { replace: true });
        }
      })
      .catch(() => {
        navigate('/login', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">
          <h1>로딩 중...</h1>
        </div>
      </div>
    );
  }

  return hasSurvey ? <MainPage /> : null;
}
