export const API_BASE_URL = 'http://localhost:8080';
const TOKEN_KEY = 'ai-walkout-auth-token';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function fetchJson(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('API 요청 실패');
  }

  return response.json();
}

export function getSurvey(token) {
  return fetchJson(`${API_BASE_URL}/api/survey/me`, token);
}

export function saveSurvey(token, surveyData) {
  return fetchJson(`${API_BASE_URL}/api/survey`, token, {
    method: 'POST',
    body: JSON.stringify(surveyData),
  });
}

export function getRoutine(token) {
  return fetchJson(`${API_BASE_URL}/api/routine/me`, token);
}

export function recommendRoutine(token) {
  return fetchJson(`${API_BASE_URL}/api/routine/recommend`, token, {
    method: 'POST',
  });
}

export function saveWorkout(token, workoutData) {
  return fetchJson(`${API_BASE_URL}/api/workout`, token, {
    method: 'POST',
    body: JSON.stringify(workoutData),
  });
}

export function getMyWorkouts(token) {
  return fetchJson(`${API_BASE_URL}/api/workout/me`, token);
}

export function getWorkoutStats(token) {
  return fetchJson(`${API_BASE_URL}/api/workout/stats`, token);
}

export function searchYoutube(token, query) {
  return fetchJson(`${API_BASE_URL}/api/youtube/search?q=${encodeURIComponent(query)}`, token);
}
