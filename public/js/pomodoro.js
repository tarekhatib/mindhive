document.addEventListener("DOMContentLoaded", () => {
  const timeDisplay = document.getElementById("pomodoro-time");
  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const increaseBtn = document.getElementById("increase-btn");
  const decreaseBtn = document.getElementById("decrease-btn");
  const finishBtn = document.getElementById("finish-btn");
  const popup = document.getElementById("pomodoro-popup");
  const closeBtn = document.getElementById("pomodoro-close");

  let timerDuration = 25 * 60;
  let startAt = null;
  let endAt = null;
  let pauseAt = null;
  let timerInterval = null;

  let pomodoroSound = new Audio("/assets/pomodoro-done.mp3");
  pomodoroSound.loop = true;
  pomodoroSound.volume = 0.7;

  ["pointerdown","click","touchstart","keydown","mouseup"].forEach(ev => {
    document.addEventListener(ev, () => {
      pomodoroSound.play().then(() => {
        pomodoroSound.pause();
        pomodoroSound.currentTime = 0;
      }).catch(() => {});
    }, { once: true });
  });

  function playCompletedSound() {
    pomodoroSound.currentTime = 0;
    pomodoroSound.play().catch(() => {});
  }

  function stopSound() {
    pomodoroSound.pause();
    pomodoroSound.currentTime = 0;
  }

  function showPopup() {
    popup?.classList.add("show");
    playCompletedSound();
    navigator.vibrate?.([120, 80, 120]);
  }

  closeBtn?.addEventListener("click", () => {
    popup?.classList.remove("show");
    stopSound();
  });

  function saveState() {
    localStorage.setItem("pomodoroState", JSON.stringify({
      timerDuration,
      endAt,
      pauseAt,
      startAt
    }));
  }

  function loadState() {
    const saved = localStorage.getItem("pomodoroState");
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      timerDuration = state.timerDuration ?? timerDuration;
      endAt = state.endAt ?? null;
      pauseAt = state.pauseAt ?? null;
      startAt = state.startAt ?? null;
    } catch {}
  }

  function updateTimerDisplay() {
    if (!timeDisplay) return;

    if (!endAt) {
      const m = String(Math.floor(timerDuration / 60)).padStart(2, "0");
      const s = String(timerDuration % 60).padStart(2, "0");
      timeDisplay.textContent = `${m}:${s}`;
      return;
    }

    const now = Date.now();
    let remaining = Math.max(0, Math.floor((endAt - now) / 1000));

    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    timeDisplay.textContent = `${m}:${s}`;
  }

  function startInterval() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
      if (!endAt) return;

      updateTimerDisplay();

      if (Date.now() >= endAt) {
        clearInterval(timerInterval);
        timerInterval = null;
        finishPomodoro(true);
      }
    }, 500);
  }

  function startTimer() {
    if (!startBtn) return;
    startAt = Date.now();
    endAt = Date.now() + timerDuration * 1000;
    pauseAt = null;
    saveState();

    startBtn.classList.add("hidden");
    finishBtn?.classList.remove("hidden");
    pauseBtn?.classList.remove("hidden");
    cancelBtn?.classList.remove("hidden");
    pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

    startInterval();
    updateTimerDisplay();
  }

  function pauseTimer() {
    if (!pauseBtn || !endAt) return;

    if (!pauseAt) {
      pauseAt = Date.now();
      clearInterval(timerInterval);
      timerInterval = null;
      pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
      const pausedDuration = Date.now() - pauseAt;
      pauseAt = null;
      endAt += pausedDuration;
      pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      startInterval();
    }

    saveState();
  }

  function cancelTimer() {
    endAt = null;
    pauseAt = null;

    timerDuration = 25 * 60;

    clearInterval(timerInterval);
    timerInterval = null;

    startBtn?.classList.remove("hidden");
    finishBtn?.classList.add("hidden");
    pauseBtn?.classList.add("hidden");
    cancelBtn?.classList.add("hidden");
    pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    updateTimerDisplay();
    saveState();
  }

  function finishPomodoro(isAutoFinish = false) {
    if (isAutoFinish === true) {
        showPopup();
    } else {
        stopSound();
    }

    const userIdElement = document.getElementById("user_id");
    const user_id = userIdElement?.value;

    if (user_id) {
      fetch("/api/pomodoro/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          points: Math.floor(timerDuration / 60)
        })
      }).catch(() => {});
    }

    endAt = null;
    pauseAt = null;
    startAt = null;

    startBtn?.classList.remove("hidden");
    finishBtn?.classList.add("hidden");
    pauseBtn?.classList.add("hidden");
    cancelBtn?.classList.add("hidden");

    updateTimerDisplay();
    saveState();
}

  function finishSession() {
    if (!finishBtn) return;

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;

    const now = Date.now();
    let remaining = endAt ? Math.max(0, Math.floor((endAt - now) / 1000)) : 0;
    let workedMinutes = Math.floor((now - startAt) / 60000);

    if (workedMinutes <= 0) {
      alert("You must complete at least 1 minute.");
      return;
    }

    const userIdElement = document.getElementById("user_id");
    const user_id = userIdElement?.value;

    fetch("/api/pomodoro/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: workedMinutes })
    }).catch(() => {});

    alert(`Session finished early! You earned ${workedMinutes} pts.`);
    cancelTimer();
  }

  increaseBtn?.addEventListener("click", () => {
    if (endAt) return;
    timerDuration += 60;
    saveState();
    updateTimerDisplay();
  });

  decreaseBtn?.addEventListener("click", () => {
  if (endAt) return;
    if (timerDuration > 60) {
      timerDuration -= 60;
      saveState();
      updateTimerDisplay();
    }
  });

  startBtn?.addEventListener("click", startTimer);
  pauseBtn?.addEventListener("click", pauseTimer);
  cancelBtn?.addEventListener("click", cancelTimer);
  finishBtn?.addEventListener("click", finishSession);

  loadState();

  setInterval(() => {
    if (endAt && Date.now() >= endAt) {
        finishPomodoro(true);
    }
    }, 1000);

    if (endAt && Date.now() >= endAt) {
        finishPomodoro(true);
        return;
    }

    if (endAt) {
        startBtn?.classList.add("hidden");
        finishBtn?.classList.remove("hidden");
        pauseBtn?.classList.remove("hidden");
        cancelBtn?.classList.remove("hidden");

    if (pauseAt) {
        pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
        pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }

    } else {
        startBtn?.classList.remove("hidden");
        finishBtn?.classList.add("hidden");
        pauseBtn?.classList.add("hidden");
        cancelBtn?.classList.add("hidden");
    }

  if (endAt && !pauseAt) {
    startInterval();
  }

  updateTimerDisplay();
});