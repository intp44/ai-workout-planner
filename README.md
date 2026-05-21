# AI 맞춤형 운동 루틴 플래너

Spring Boot 기반 AI 맞춤형 운동 루틴 플래너 웹앱의 백엔드 초기 구조입니다.

## 디렉터리 구조

- `backend/` - Spring Boot 백엔드 프로젝트
- `frontend/` - 프론트엔드 코드 위치 (추후 구현)
- `docs/` - API 명세 및 DB 설계 문서

## 백엔드 기술 스택

- Spring Boot (Java)
- PostgreSQL
- Spring Security + Google OAuth2
- Google Gemini API
- YouTube Data API v3

## 시작

1. `backend` 디렉터리로 이동
2. `frontend` 디렉터리로 이동
3. `application.properties`에 환경 변수를 채워넣기

## 실행

### 백엔드

```bash
cd backend
./gradlew bootRun
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

## 설정

- `backend/src/main/resources/application.properties`에 PostgreSQL, Google OAuth2, JWT 비밀키를 입력합니다.
- Google OAuth2 리디렉션 URI는 `http://localhost:8080/login/oauth2/code/google`로 등록해야 합니다.
