export type ChallengeLength = 21 | 30 | 60 | 75;

export const DEFAULT_CHALLENGE_LENGTH: ChallengeLength = 75;

export const CHALLENGE_LENGTHS: ChallengeLength[] = [21, 30, 60, 75];

export type DailyProgressRow = {
  challenge_day: number;
  move: boolean;
  get_outside: boolean;
  hydrate: boolean;
  read: boolean;
  nourish: boolean;
  document: boolean;
  no_alcohol: boolean;
};

export function parseChallengeDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function isValidChallengeLength(
  value: number
): value is ChallengeLength {
  return CHALLENGE_LENGTHS.includes(value as ChallengeLength);
}

export function getCurrentChallengeDay(
  challengeStartDate: string,
  challengeLengthOrToday: number | Date = DEFAULT_CHALLENGE_LENGTH,
  todayArg = new Date()
) {
  const challengeLength =
    challengeLengthOrToday instanceof Date
      ? DEFAULT_CHALLENGE_LENGTH
      : challengeLengthOrToday;

  const today =
    challengeLengthOrToday instanceof Date
      ? challengeLengthOrToday
      : todayArg;

  const [year, month, day] = challengeStartDate.split("-").map(Number);

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
    challengeLength
  );
}

export function getChallengeEndDate(
  challengeStartDate: string,
  challengeLength: number = DEFAULT_CHALLENGE_LENGTH
) {
  const startDate = parseChallengeDate(challengeStartDate);

  const endDate = new Date(startDate);

  endDate.setDate(
    endDate.getDate() + challengeLength - 1
  );

  return endDate;
}

export function isDayComplete(row: DailyProgressRow) {
  return (
    row.move &&
    row.get_outside &&
    row.hydrate &&
    row.read &&
    row.nourish &&
    row.document &&
    row.no_alcohol
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
  const completedSet = new Set(completedDayNumbers);

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
  completedDays: number,
  challengeLength: number = DEFAULT_CHALLENGE_LENGTH
) {
  if (challengeLength <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((completedDays / challengeLength) * 100)
  );
}