import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import LoginSuccess from './LoginSuccess';
import HomeRoute from './HomeRoute';
import SurveyPage from './SurveyPage';
import RoutinePage from './RoutinePage';
import WorkoutPage from './WorkoutPage';
import InBodyPage from './InBodyPage';
import { getAuthToken } from './api';

function App() {
  const token = getAuthToken();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/login/success" element={<LoginSuccess />} />
      <Route path="/survey" element={token ? <SurveyPage /> : <Navigate to="/login" replace />} />
      <Route path="/routine" element={token ? <RoutinePage /> : <Navigate to="/login" replace />} />
      <Route path="/workout" element={token ? <WorkoutPage /> : <Navigate to="/login" replace />} />
      <Route path="/inbody" element={token ? <InBodyPage /> : <Navigate to="/login" replace />} />
      <Route path="/" element={token ? <HomeRoute /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
