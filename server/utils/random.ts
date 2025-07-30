export const getRandomRoomPIN = (pinLength = 6): string => {
  const min = Math.pow(10, pinLength - 1);
  const max = Math.pow(10, pinLength) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};
