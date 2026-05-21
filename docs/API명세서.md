# API 명세서

이 문서는 AI 맞춤형 운동 루틴 플래너 백엔드의 주요 API를 정의합니다.

## 인증

- `GET /oauth2/authorization/google`
  - Google OAuth2 로그인 시작

- `GET /login/oauth2/code/google`
  - OAuth2 리디렉션 콜백

- 로그인 성공 시 백엔드는 프론트엔드 URL로 JWT를 포함하여 리디렉트합니다.
  예: `http://localhost:3000/login/success?token=...`

## 사용자

- `GET /api/auth/me`
  - 로그인한 사용자 정보 조회

## 설문조사

- `POST /api/survey`
  - 사용자의 설문조사 결과 저장

- `GET /api/survey/me`
  - 내 설문조사 결과 조회

## 루틴

- `POST /api/routine/recommend`
  - 사용자 설문 데이터를 기반으로 AI 루틴 추천 생성

- `GET /api/routine/me`
  - 내 최신 추천 루틴 조회

## 운동 기록

- `POST /api/workout`
  - 운동 기록 저장

- `GET /api/workout/me`
  - 내 운동 기록 전체 조회

- `GET /api/workout/stats`
  - 주간/월간 통계 조회

## 인바디 기록

- `POST /api/inbody-records`
  - 인바디 기록 저장

- `GET /api/inbody-records/user/{userId}`
  - 사용자 인바디 기록 조회

> 실제 엔드포인트와 요청/응답 모델은 구현 단계에서 상세화합니다.
