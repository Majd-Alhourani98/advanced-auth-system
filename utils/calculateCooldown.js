// utils/cooldown.js
export const calculateCooldown = resendCount => {
  const baseCooldown = 10 * 1000; // 10 seconds (example)
  const maxCooldown = 60 * 60 * 1000; // 1 hour

  if (resendCount >= 5) {
    return maxCooldown;
  }

  return baseCooldown * resendCount;
};
