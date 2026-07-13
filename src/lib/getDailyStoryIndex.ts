export function getDailyStoryIndex(
  characterId: string,
  imagesLength: number
): number {
  if (imagesLength === 0) return -1;

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

  return (dayKey + hash) % imagesLength;
}
