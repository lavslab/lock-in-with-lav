export type DailyProgressRow = {
  challenge_day: number;
  move: boolean;
  get_outside: boolean;
  hydrate: boolean;
  read: boolean;
  nourish: boolean;
  document: boolean;
};

export function parseChallengeDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function getCurrentChallengeDay(
  challengeStartDate: string,
  today = new Date()
) {
  const [year, month, day] = challengeStartDate
    .split("-")
    .map(Number);

  const startUtc = Date.UTC(year, month - 1, day);

  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const differenceInDays = Math.floor(
    (todayUtc - startUtc) / (1000 * 60 * 60 * 24)
  );

  return Math.min(
    Math.max(differenceInDays + 1, 1),
    75
  );
}

export function getChallengeEndDate(
  challengeStartDate: string
) {
  const startDate = parseChallengeDate(
    challengeStartDate
  );

  const endDate = new Date(startDate);

  endDate.setDate(endDate.getDate() + 74);

  return endDate;
}

export function isDayComplete(
  row: DailyProgressRow
) {
  return (
    row.move &&
    row.get_outside &&
    row.hydrate &&
    row.read &&
    row.nourish &&
    row.document
  );
}

export function getCompletedDayNumbers(
  dailyProgress: DailyProgressRow[]
) {
  return dailyProgress
    .filter(isDayComplete)
    .map((row) => row.challenge_day);
}

export function calculateStreak(
  completedDayNumbers: number[],
  currentDay: number
) {
  const completedSet = new Set(
    completedDayNumbers
  );

  let dayToCheck = currentDay;

  // Don't kill today's streak just because
  // the member hasn't finished today's tasks yet.
  if (!completedSet.has(dayToCheck)) {
    dayToCheck -= 1;
  }

  let streak = 0;

  while (
    dayToCheck >= 1 &&
    completedSet.has(dayToCheck)
  ) {
    streak += 1;
    dayToCheck -= 1;
  }

  return streak;
}

export function getChallengePercentage(
  completedDays: number
) {
  return Math.round(
    (completedDays / 75) * 100
  );
}