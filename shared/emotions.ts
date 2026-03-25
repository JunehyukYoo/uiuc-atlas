export const EMOTIONS = [
  'CALM',
  'STRESSED',
  'INSPIRED',
  'LONELY',
  'FRUSTRATED',
  'ENERGIZED',
];

export type EmotionValue = (typeof EMOTIONS)[number];

export const EMOTION_META: Record<
  EmotionValue,
  { label: string; color: string; order: number }
> = {
  CALM: { label: 'Calm', color: '#4A90E2', order: 1 },
  STRESSED: { label: 'Stressed', color: '#D64545', order: 2 },
  INSPIRED: { label: 'Inspired', color: '#F5A623', order: 3 },
  LONELY: { label: 'Lonely', color: '#7B6FD6', order: 4 },
  FRUSTRATED: { label: 'Frustrated', color: '#C96C1A', order: 5 },
  ENERGIZED: { label: 'Energized', color: '#2BB673', order: 6 },
};