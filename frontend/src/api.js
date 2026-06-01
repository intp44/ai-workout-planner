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

export function getRoutineWithCondition(token, condition) {
  return fetchJson(`${API_BASE_URL}/api/routine/recommend/with-condition`, token, {
    method: 'POST',
    body: JSON.stringify(condition),
  });
}

export function getExerciseReplacement(token, replacementRequest) {
  return fetchJson(`${API_BASE_URL}/api/routine/replacement`, token, {
    method: 'POST',
    body: JSON.stringify(replacementRequest),
  });
}

// InBody API 함수들
export async function analyzeInBodyImage(token, imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/inbody/analyze`, {
    method: 'POST',
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('이미지 분석 실패');
  }

  return response.json();
}

export function saveInBodyRecord(token, inBodyData) {
  return fetchJson(`${API_BASE_URL}/api/inbody/save`, token, {
    method: 'POST',
    body: JSON.stringify(inBodyData),
  });
}

export function updateInBodyRecord(token, recordId, inBodyData) {
  return fetchJson(`${API_BASE_URL}/api/inbody/${recordId}`, token, {
    method: 'PUT',
    body: JSON.stringify(inBodyData),
  });
}

export function getLatestInBodyRecord(token) {
  return fetchJson(`${API_BASE_URL}/api/inbody/latest`, token);
}

export function getInBodyRecordHistory(token) {
  return fetchJson(`${API_BASE_URL}/api/inbody/history`, token);
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

export function saveInBody(token, data) {
  return fetchJson(`${API_BASE_URL}/api/inbody`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMyInBody(token) {
  return fetchJson(`${API_BASE_URL}/api/inbody/me`, token);
}
