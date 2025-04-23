
export const playClickSound = () => {
  const sound = new Audio("/sounds/click.mp3");
  sound.volume = 0.5; 
  sound.play().catch((error) => console.error("Error playing click sound:", error));
};

export const playSuccessSound = () => {
  const sound = new Audio("/sounds/success.mp3");
  sound.volume = 0.7;
  sound.play().catch((error) => console.error("Error playing success sound:", error));
};