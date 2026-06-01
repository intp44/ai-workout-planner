const MONTHLY_FEES = [5, 6, 7, 8, 9, 10];
const randomFee = () => MONTHLY_FEES[Math.floor(Math.random() * MONTHLY_FEES.length)];

export function getMotivationMessage(name, daysSince) {
  const days = daysSince ?? '??';
  const fee = randomFee();

  const messages = [
    `오늘의 헬스장 기부 천사는 ~~ ${name}님!!`,
    `한 달에 ${fee}만 원씩 내고 락커 임대료만 내는 중 인가요??`,
    `안 갈 거면 저 양도 해주면 안되나용??`,
    `"내일부터"가 벌써 ${days}일째다.`,
    `${name}님, 티 바 로우 머신 얼굴도 까먹었지?`,
    `운동복 새로 산 거 잘 보관돼 있더라. 진짜 새것처럼.`,
    `헬스장 트레이너가 ${name}님 실종 신고 할 뻔했대.`,
    `등록한 지 ${days}일 됐다며? 운동 효과 좀 봤어? ...아, 미안 까먹었네.`,
    `헬스장 사장님이 ${name}님한테 감사패 드린다더라. 충성 고객이라고.`,
    `괜찮아, 헬스장 운영에 기여하는 것도 사회 공헌이야.`,
    `다이어트는 마음먹는 게 90%라잖아. ${name}님은 그 90%까지 왔어. 진짜.`,
    `운동은 안 했어도, '끊었다'는 자존감은 챙겼잖아.`,
    `헬스장이 ${name}님한테 부담을 안 주려고 멀리 있는 거야. 배려심 깊지?`,
    `지금 핸드폰 내려놓고 운동복 갈아입는 데까지 10분이면 끝나.`,
    `1년 뒤 거울 속 ${name}님 모습, 지금 결정하는 거야.`,
    `"오늘은 피곤해서"가 어제도, 그제도, 그그제도 이유였어.`,
    `헬스장 가는 길이 멀게 느껴지는 건, 안 가본 지 ${days}일 됐기 때문이야.`,
    `일어나...! ${name}님, 일어나...!`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

export function getDaysSinceLastWorkout(workouts) {
  if (!workouts || workouts.length === 0) return null;
  const sorted = [...workouts].sort((a, b) => new Date(b.workoutDate) - new Date(a.workoutDate));
  const last = new Date(sorted[0].workoutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  return Math.floor((today - last) / (1000 * 60 * 60 * 24));
}
