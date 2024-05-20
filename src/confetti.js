import confetti from 'canvas-confetti';

// https://github.com/catdad/canvas-confetti
// demo: https://www.kirilv.com/canvas-confetti/


function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}


export function sparkDrip(count = 3) {
  confetti({
    particleCount: Math.sqrt(count*5),
    colors: ['#cbd5e1', '#d6dbe1', '#fff'],
    shapes: ['circle'],
    // spread: 50,
    spread: 180,
    ticks: 20,
    scalar: 0.5,
    flat: true,
    startVelocity: Math.sqrt(10 * count),
    angle: 225,
    origin: { x: 1, y: 0 }
  });
}

export function fireConfetti() {
  confetti({
    angle: randomInRange(0, 360),
    spread: randomInRange(50, 150),
    particleCount: randomInRange(50, 100),
    origin: { y: 0.5, x: 0.6 },
    ticks: randomInRange(50, 200),
  });
}

export function launchFireworks() {
  var duration = 6 * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 10, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var interval = setInterval(function () {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}
