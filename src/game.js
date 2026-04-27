export const MODES = Object.freeze({
  CONNECTION: 'connection',
  STILLNESS: 'stillness'
});

export const SCENES = Object.freeze({
  BOOT: 'BootScene',
  MODE_SELECT: 'ModeSelectScene',
  GAME: 'GameScene',
  MESSAGE: 'MessageScene'
});

export const GAME_CONFIG = Object.freeze({
  baseWidth: 390,
  baseHeight: 844,
  backgroundColor: '#0c131b'
});

export const WORLD = Object.freeze({
  width: 1560,
  height: 2500,
  encounterRadius: 98,
  playerRadius: 14,
  characterRadius: 18,
  boundaryPaddingX: 70,
  boundaryPaddingY: 104
});

export const PLAYER = Object.freeze({
  dragDeadZone: 18,
  connectionSpeed: 132,
  stillnessSpeed: 84,
  connectionAccel: 0.13,
  connectionDecel: 0.095,
  stillnessAccel: 0.068,
  stillnessDecel: 0.058
});

export const CAMERA = Object.freeze({
  zoom: 1,
  lerpConnection: 0.072,
  lerpStillness: 0.05,
  deadzoneWidth: 88,
  deadzoneHeight: 144
});

export const TIMINGS = Object.freeze({
  selectionCommitMs: 1900,
  entryLockMs: 5000,
  messageFadeInMs: 1040,
  messageHoldMs: 3300,
  messageFadeOutMs: 1320,
  releaseSettleMs: 860,
  worldSettleOnHideMs: 1500
});

export const COLORS = Object.freeze({
  worldTop: 0x172433,
  worldBottom: 0x0a0f15,
  white: 0xffffff,
  connection: {
    accent: 0x83dde1,
    glow: 0xd8fbf6,
    line: 0x75d8df,
    surface: 0x1b3340,
    mist: 0x96e0e3,
    textAccent: '#d6fbf7'
  },
  stillness: {
    accent: 0xb8c8df,
    glow: 0xf0f4f8,
    line: 0x92a2b8,
    surface: 0x1a232d,
    mist: 0xdce5ef,
    textAccent: '#f0f4f8'
  }
});

export const WORLD_LAYOUT = Object.freeze({
  islands: [
    { x: 780, y: 2230, w: 950, h: 286, r: 98, alpha: 0.18 },
    { x: 540, y: 1790, w: 500, h: 180, r: 66, alpha: 0.15 },
    { x: 1040, y: 1700, w: 520, h: 180, r: 66, alpha: 0.15 },
    { x: 760, y: 1360, w: 650, h: 188, r: 80, alpha: 0.14 },
    { x: 1180, y: 1120, w: 360, h: 146, r: 56, alpha: 0.12 },
    { x: 380, y: 1120, w: 340, h: 138, r: 56, alpha: 0.12 },
    { x: 760, y: 780, w: 470, h: 152, r: 60, alpha: 0.12 }
  ],
  monoliths: [
    { x: 286, y: 1950, w: 44, h: 176, alpha: 0.08 },
    { x: 1254, y: 1910, w: 54, h: 198, alpha: 0.08 },
    { x: 1024, y: 1260, w: 42, h: 146, alpha: 0.07 },
    { x: 510, y: 950, w: 40, h: 134, alpha: 0.07 },
    { x: 850, y: 648, w: 38, h: 126, alpha: 0.065 }
  ],
  ambientRings: [
    { x: 780, y: 2180, r: 256, a: 0.024 },
    { x: 560, y: 1460, r: 190, a: 0.021 },
    { x: 1040, y: 1360, r: 182, a: 0.02 },
    { x: 760, y: 780, r: 160, a: 0.018 }
  ]
});

export const CHARACTER_LAYOUT = Object.freeze([
  { id: 'shore', x: 470, y: 2010 },
  { id: 'crossing', x: 1060, y: 2000 },
  { id: 'listen', x: 470, y: 1580 },
  { id: 'between', x: 1048, y: 1500 },
  { id: 'height', x: 1180, y: 1130 },
  { id: 'return', x: 752, y: 820 }
]);

export const MODE_DESCRIPTIONS = Object.freeze({
  [MODES.CONNECTION]: {
    title: 'Follow what quietly connects',
    body: 'Forms answer one another. Relation gathers without asking to be solved.'
  },
  [MODES.STILLNESS]: {
    title: 'Remain where silence can speak',
    body: 'Nothing urges you forward. Meaning arrives by staying present long enough.'
  }
});

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

export function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function getModePalette(mode) {
  return mode === MODES.CONNECTION ? COLORS.connection : COLORS.stillness;
}

export function getMoveConfig(mode) {
  if (mode === MODES.CONNECTION) {
    return {
      speed: PLAYER.connectionSpeed,
      accel: PLAYER.connectionAccel,
      decel: PLAYER.connectionDecel
    };
  }

  return {
    speed: PLAYER.stillnessSpeed,
    accel: PLAYER.stillnessAccel,
    decel: PLAYER.stillnessDecel
  };
}

export function getCameraLerp(mode) {
  return mode === MODES.CONNECTION ? CAMERA.lerpConnection : CAMERA.lerpStillness;
}

export function getOverlayRoot() {
  return document.getElementById('overlay-root');
}

export function getCanvasMetrics() {
  const canvas = document.querySelector('#game-root canvas');

  if (!canvas) {
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  const rect = canvas.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
}

export function gamePointToViewport(point) {
  const rect = getCanvasMetrics();
  return {
    x: rect.left + (point.x / GAME_CONFIG.baseWidth) * rect.width,
    y: rect.top + (point.y / GAME_CONFIG.baseHeight) * rect.height,
    rect
  };
}

export function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}
