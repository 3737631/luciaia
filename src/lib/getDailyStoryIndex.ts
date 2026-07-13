export function getDailyStorySelection(
  characterId: string,
  imagesLength: number
): number[] {
  if (imagesLength === 0) return [];

  const now = new Date();
  const dayKey = Math.floor(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ) / 86400000
  );

  let hash = 0;
  for (let i = 0; i < characterId.length; i++) {
    hash = (hash * 31 + characterId.charCodeAt(i)) >>> 0;
  }

  const startIdx = (dayKey + hash) % imagesLength;
  const count = ((dayKey + hash + 7) % 2) + 1;
  const indices: number[] = [startIdx];
  if (count === 2 && imagesLength >= 2) {
    indices.push((startIdx + 1) % imagesLength);
  }
  return indices;
}
