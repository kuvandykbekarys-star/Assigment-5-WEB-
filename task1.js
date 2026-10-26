const GAME_MIN_VALUE = 1;
const GAME_MAX_VALUE = 99;
const GAME_STARTING_LIVES = 3;
const GAME_BEST_KEY = "tiny-arcade-best-streak";

const gameSection = document.querySelector("#game");
const currentValueElement = document.querySelector("#current-value");
const promptElement = document.querySelector("#game-prompt");
const livesElement = document.querySelector("#lives");
const streakElement = document.querySelector("#streak");
const bestStreakElement = document.querySelector("#best-streak");
const roundElement = document.querySelector("#round-label");
const gameMessageElement = document.querySelector("#game-message");
const gameAnnouncementElement = document.querySelector("#game-announcement");
const restartGameButton = document.querySelector("#restart-game");

let gameState = {
  current: randomGameValue(),
  next: randomGameValue(),
  lives: GAME_STARTING_LIVES,
  streak: 0,
  round: 1,
  finished: false,
};

function randomGameValue() {
  return Math.floor(Math.random() * (GAME_MAX_VALUE - GAME_MIN_VALUE + 1)) + GAME_MIN_VALUE;
}

function readBestStreak() {
  try {
    return Number(localStorage.getItem(GAME_BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function renderGame() {
  currentValueElement.textContent = String(gameState.current);
  streakElement.textContent = String(gameState.streak);
  bestStreakElement.textContent = String(readBestStreak());
  roundElement.textContent = `ROUND ${String(gameState.round).padStart(2, "0")}`;
  livesElement.replaceChildren();

  for (let lifeIndex = 0; lifeIndex < GAME_STARTING_LIVES; lifeIndex += 1) {
    const heart = document.createElement("span");
    heart.textContent = "♥";
    heart.className = lifeIndex < gameState.lives ? "" : "lost-life";
    heart.setAttribute("aria-hidden", "true");
    livesElement.append(heart);
  }

  livesElement.setAttribute("aria-label", `${gameState.lives} ${gameState.lives === 1 ? "life" : "lives"} left`);
  gameSection.querySelectorAll("[data-guess]").forEach((button) => {
    button.disabled = gameState.finished;
  });
  restartGameButton.hidden = !gameState.finished;
  promptElement.textContent = gameState.finished
    ? "The round is over. Start a fresh game when you are ready."
    : "Will the next number be higher or lower?";
}

function setGameMessage(message, state = "") {
  gameMessageElement.textContent = message;
  gameMessageElement.className = `game-message${state ? ` is-${state}` : ""}`;
  gameAnnouncementElement.textContent = message;
}

function finishGame(finalStreak) {
  gameState.finished = true;
  setGameMessage(`Game over. Your streak before the last miss was ${finalStreak}. Start again and beat your best!`, "loss");
}

function handleGuess(direction) {
  if (gameState.finished || (direction !== "higher" && direction !== "lower")) {
    setGameMessage("That move is not available. Choose Higher or Lower while the game is active.", "error");
    return;
  }

  const wasEqual = gameState.next === gameState.current;
  const guessedCorrectly = wasEqual || (direction === "higher" && gameState.next > gameState.current) || (direction === "lower" && gameState.next < gameState.current);
  const previousValue = gameState.current;
  const drawnValue = gameState.next;

  gameState.current = drawnValue;
  gameState.round += 1;

  if (guessedCorrectly) {
    gameState.streak += 1;
    const bestStreak = readBestStreak();
    if (gameState.streak > bestStreak) {
      try {
        localStorage.setItem(GAME_BEST_KEY, String(gameState.streak));
      } catch {
        // The best streak remains available for this session if storage is blocked.
      }
    }
    gameState.next = randomGameValue();
    setGameMessage(wasEqual ? `A tie at ${drawnValue} counts as a correct guess. Streak: ${gameState.streak}!` : `${drawnValue} is ${drawnValue > previousValue ? "higher" : "lower"}. Nice call — streak: ${gameState.streak}!`, wasEqual ? "tie" : "win");
  } else {
    const finalStreak = gameState.streak;
    gameState.streak = 0;
    gameState.lives -= 1;
    gameState.next = randomGameValue();
    if (gameState.lives === 0) {
      finishGame(finalStreak);
    } else {
      setGameMessage(`${drawnValue} was ${drawnValue > previousValue ? "higher" : "lower"}. One life used; ${gameState.lives} left.`, "loss");
    }
  }

  renderGame();
}

gameSection.addEventListener("click", (event) => {
  const guessButton = event.target.closest("button[data-guess]");
  if (guessButton && gameSection.contains(guessButton)) {
    handleGuess(guessButton.dataset.guess);
  }
});

restartGameButton.addEventListener("click", () => {
  gameState = {
    current: randomGameValue(),
    next: randomGameValue(),
    lives: GAME_STARTING_LIVES,
    streak: 0,
    round: 1,
    finished: false,
  };
  setGameMessage("New round, fresh start. Pick a direction.");
  renderGame();
  gameSection.querySelector('[data-guess="higher"]').focus();
});

renderGame();
