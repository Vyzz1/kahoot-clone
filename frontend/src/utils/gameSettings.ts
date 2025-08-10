export interface GameSettings {
  autoEndQuestion?: boolean;
  autoNextQuestion?: boolean;
  autoNextQuestionDelay?: number;
}

export const GAME_SETTINGS_KEY = "game_settings";

export const saveGameSettings = (
  gameId: string,
  settings: GameSettings
): void => {
  const key = `${GAME_SETTINGS_KEY}_${gameId}`;
  localStorage.setItem(key, JSON.stringify(settings));
};

export const getGameSettings = (gameId: string): GameSettings | null => {
  const key = `${GAME_SETTINGS_KEY}_${gameId}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const clearGameSettings = (gameId: string): void => {
  const key = `${GAME_SETTINGS_KEY}_${gameId}`;
  localStorage.removeItem(key);
};
