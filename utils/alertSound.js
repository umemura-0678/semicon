let audioContext = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return null;
    }
    audioContext = new AudioCtx();
  }

  return audioContext;
}

export function unlockAlertSound() {
  const context = getAudioContext();
  if (context?.state === "suspended") {
    context.resume().catch(() => {});
  }
}

function playBeep(context, when, duration = 0.18, frequency = 1480, volume = 0.45) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const peakAt = when + 0.01;
  const fadeAt = when + Math.max(0.05, duration - 0.02);

  oscillator.type = "square";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(volume, peakAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, fadeAt);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(when);
  oscillator.stop(when + duration);
  return oscillator;
}

export function playShortBeeps() {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  function start() {
    const now = context.currentTime;
    playBeep(context, now, 0.09, 740, 0.16);
    playBeep(context, now + 0.12, 0.09, 740, 0.16);
  }

  if (context.state === "suspended") {
    context.resume().then(start).catch(() => {});
  } else {
    start();
  }
}

export function playWarningBeeps() {
  const context = getAudioContext();
  if (!context) {
    return () => {};
  }

  let cancelled = false;
  const oscillators = [];

  function start() {
    if (cancelled) {
      return;
    }

    const now = context.currentTime;
    oscillators.push(playBeep(context, now));
    oscillators.push(playBeep(context, now + 1));
    oscillators.push(playBeep(context, now + 2));
  }

  if (context.state === "suspended") {
    context.resume().then(start).catch(() => {});
  } else {
    start();
  }

  return () => {
    cancelled = true;
    oscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        /* already stopped */
      }
    });
  };
}
