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

  const pomodoroSound = new Audio("/assets/pomodoro-done.mp3");
  pomodoroSound.loop = true;
  pomodoroSound.volume = 0.7;
  let audioUnlocked = false;
  let needsReplayAfterUnlock = false;

  function playCompletedSound() {
    pomodoroSound.currentTime = 0;
    pomodoroSound.play().catch(() => {});
  }

  function stopSound() {
    pomodoroSound.pause();
    pomodoroSound.currentTime = 0;
  }

  function showPopup() {
    if (popup) {
      popup.classList.add("show");
    }
    playCompletedSound();
    navigator.vibrate?.([120, 80, 120]);
  }

  closeBtn?.addEventListener("click", () => {
    if (popup) {
      popup.classList.remove("show");
    }
    stopSound();
  });

  // ---- UNIVERSAL AUDIO UNLOCK FOR ALL PAGES ----
  function unlockAudio() {
    if (audioUnlocked) return;

    pomodoroSound
      .play()
      .then(() => {
        pomodoroSound.pause();
        pomodoroSound.currentTime = 0;
        audioUnlocked = true;

        if (needsReplayAfterUnlock) {
          needsReplayAfterUnlock = false;
          showPopup();
        }
        localStorage.setItem("pomodoroAudioUnlocked", "1");
      })
      .catch(() => {});
  }

  if (localStorage.getItem("pomodoroAudioUnlocked") === "1") {
    audioUnlocked = true;
  }

  ["click", "keydown", "touchstart", "mousemove", "scroll"].forEach((ev) => {
    document.addEventListener(
      ev,
      () => {
        unlockAudio();
      },
      { once: true }
    );
  });

  function saveState() {
    localStorage.setItem(
      "pomodoroState",
      JSON.stringify({
        timerDuration,
        endAt,
        pauseAt,
        startAt,
      })
    );
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
    const remaining = Math.max(0, Math.floor((endAt - now) / 1000));
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    timeDisplay.textContent = `${m}:${s}`;
  }

  function startInterval() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
      if (!endAt) return;

      const now = Date.now();
      if (now >= endAt) {
        clearInterval(timerInterval);
        timerInterval = null;
        finishPomodoro(true);
        return;
      }

      updateTimerDisplay();
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
    if (pauseBtn) pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

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
    startAt = null;

    timerDuration = 25 * 60;

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    startBtn?.classList.remove("hidden");
    finishBtn?.classList.add("hidden");
    pauseBtn?.classList.add("hidden");
    cancelBtn?.classList.add("hidden");
    if (pauseBtn) pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

    updateTimerDisplay();
    saveState();
  }

  function finishPomodoro(isAutoFinish = false) {
    if (isAutoFinish) {
      showPopup();
      if (!audioUnlocked) {
        needsReplayAfterUnlock = true;
      }
    } else {
      stopSound();
    }

    const now = Date.now();
    let points = Math.floor(timerDuration / 60);

    if (!isAutoFinish && startAt) {
      const workedMinutes = Math.floor((now - startAt) / 60000);
      points = workedMinutes > 0 ? workedMinutes : 0;
    }

    if (points > 0) {
      const userIdElement = document.getElementById("user_id");
      const user_id = userIdElement?.value;
      const payload = { points };
      if (user_id) payload.user_id = user_id;

      fetch("/api/pomodoro/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    endAt = null;
    pauseAt = null;
    startAt = null;
    timerDuration = 25 * 60;

    startBtn?.classList.remove("hidden");
    finishBtn?.classList.add("hidden");
    pauseBtn?.classList.add("hidden");
    cancelBtn?.classList.add("hidden");
    if (pauseBtn) pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

    updateTimerDisplay();
    saveState();
  }

  function finishSession() {
    if (!finishBtn) return;

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    const now = Date.now();
    if (!startAt) {
      alert("You must complete at least 1 minute.");
      return;
    }

    const workedMinutes = Math.floor((now - startAt) / 60000);

    if (workedMinutes <= 0) {
      alert("You must complete at least 1 minute.");
      return;
    }

    const userIdElement = document.getElementById("user_id");
    const user_id = userIdElement?.value;
    const payload = { points: workedMinutes };
    if (user_id) payload.user_id = user_id;

    fetch("/api/pomodoro/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

  /*EDITABLE TIMER INPUT*/

  const timerEl = document.getElementById("pomodoro-time");

  timerEl?.addEventListener("click", () => {
    if (endAt) return;

    timerEl.contentEditable = "true";
    timerEl.classList.add("editing");
    timerEl.focus();

    const range = document.createRange();
    range.selectNodeContents(timerEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  });

  function applyEditedTime() {
    timerEl.contentEditable = "false";
    timerEl.classList.remove("editing");

    let val = timerEl.textContent.trim();

    val = val.replace(/[^\d:]/g, "");

    let minutes = 0;
    let seconds = 0;

    if (/^\d+$/.test(val)) {
      minutes = parseInt(val);
    } else if (/^\d*:\d*$/.test(val)) {
      const parts = val.split(":");
      minutes = parseInt(parts[0] || "0");
      seconds = parseInt(parts[1] || "0");
      if (seconds > 59) seconds = 59;
    } else {
      timerEl.textContent = "25:00";
      timerDuration = 25 * 60;
      updateTimerDisplay();
      return;
    }

    if (minutes < 0) minutes = 0;
    if (minutes > 90) minutes = 90;

    timerDuration = minutes * 60 + seconds;

    const m = String(minutes).padStart(2, "0");
    const s = String(seconds).padStart(2, "0");
    timerEl.textContent = `${m}:${s}`;

    saveState();
  }

  timerEl?.addEventListener("blur", applyEditedTime);

  timerEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      timerEl.blur();
    }
  });

  timerEl?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      timerEl.contentEditable = "false";
      timerEl.classList.remove("editing");
      updateTimerDisplay();
    }
  });

  loadState();

  if (endAt) {
    if (Date.now() >= endAt) {
      finishPomodoro(true);
    } else {
      startBtn?.classList.add("hidden");
      finishBtn?.classList.remove("hidden");
      pauseBtn?.classList.remove("hidden");
      cancelBtn?.classList.remove("hidden");
      if (pauseBtn) {
        pauseBtn.innerHTML = pauseAt
          ? '<i class="fa-solid fa-play"></i>'
          : '<i class="fa-solid fa-pause"></i>';
      }

      if (!pauseAt) {
        startInterval();
      }
    }
  } else {
    startBtn?.classList.remove("hidden");
    finishBtn?.classList.add("hidden");
    pauseBtn?.classList.add("hidden");
    cancelBtn?.classList.add("hidden");
  }

  setInterval(() => {
    if (!endAt) return;

    const now = Date.now();
    if (now >= endAt) {
      finishPomodoro(true);
    }
  }, 1000);

  updateTimerDisplay();
});
