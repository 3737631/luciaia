interface LipSegment {
  startMs: number;
  endMs: number;
}

interface LipProfile {
  src: string;
  durationMs: number;
  rate: number;
  pitch: number;
  breathDurationMs: number;
  speakSegments: LipSegment[];
}

const basePath = "/luciaia";

export const GIRL_VIDEO_IDS = ["kira", "athena", "sofia"] as const;
export type VideoGirlId = (typeof GIRL_VIDEO_IDS)[number];

export const lipProfiles: Record<VideoGirlId, LipProfile> = {
  kira: {
    src: `${basePath}/kira-q.mp4`,
    durationMs: 60230,
    rate: 0.88,
    pitch: -2.15,
    breathDurationMs: 80,
    speakSegments: [
      { startMs: 9000, endMs: 18000 },
      { startMs: 28000, endMs: 39000 },
      { startMs: 39000, endMs: 52000 },
    ],
  },
  athena: {
    src: `${basePath}/athena-q.mp4`,
    durationMs: 40000,
    rate: 1.03,
    pitch: 1.85,
    breathDurationMs: 74,
    speakSegments: [
      { startMs: 5000, endMs: 13000 },
      { startMs: 20000, endMs: 29000 },
      { startMs: 29000, endMs: 36000 },
    ],
  },
  sofia: {
    src: `${basePath}/sofia-q.mp4`,
    durationMs: 60000,
    rate: 0.96,
    pitch: -0.25,
    breathDurationMs: 74,
    speakSegments: [
      { startMs: 12000, endMs: 22000 },
      { startMs: 33000, endMs: 46000 },
    ],
  },
};

export function isVideoGirl(girlId: string): girlId is VideoGirlId {
  return girlId === "kira" || girlId === "athena" || girlId === "sofia";
}

export function getLipProfile(girlId: string): LipProfile | undefined {
  return isVideoGirl(girlId) ? lipProfiles[girlId] : undefined;
}

export function estimateSpeechMs(text: string, profile: LipProfile): number {
  return Math.max(700, Math.round(text.length * 45 / profile.rate));
}

export function pickSpeakSegment(
  profile: LipProfile,
  targetMs: number,
  lastPickMs: number
): LipSegment {
  const segs = profile.speakSegments;
  if (segs.length === 0) {
    return { startMs: 0, endMs: profile.durationMs };
  }
  let best = segs[0];
  let bestScore = Infinity;
  for (const s of segs) {
    if (s.startMs <= lastPickMs && lastPickMs < s.endMs) continue;
    const dur = s.endMs - s.startMs;
    const fit = Math.abs(dur - targetMs);
    if (fit < bestScore) {
      bestScore = fit;
      best = s;
    }
  }
  return best;
}