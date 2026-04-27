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
  backgroundColor: '#0d1520'
});

export const WORLD = Object.freeze({
  width: 1560,
  height: 2480,
  playerRadius: 14,
  characterRadius: 18,
  encounterRadius: 94,
  boundaryPaddingX: 76,
  boundaryPaddingY: 110
});

export const PLAYER = Object.freeze({
  dragDeadZone: 18,
  connectionSpeed: 132,
  stillnessSpeed: 82,
  connectionAccel: 0.13,
  connectionDecel: 0.095,
  stillnessAccel: 0.066,
  stillnessDecel: 0.058
});

export const CAMERA = Object.freeze({
  zoom: 1,
  deadzoneWidth: 88,
  deadzoneHeight: 144,
  lerpConnection: 0.072,
  lerpStillness: 0.05
});

export const TIMINGS = Object.freeze({
  selectionCommitMs: 1850,
  entryLockMs: 5000,
  messageFadeInMs: 980,
  messageHoldMs: 3200,
  messageFadeOutMs: 1260,
  releaseSettleMs: 820,
  worldSettleOnHideMs: 1400
});

export const COLORS = Object.freeze({
  worldTop: 0x182635,
  worldBottom: 0x0a0f16,
  white: 0xffffff,
  connection: {
    accent: 0x7fdade,
    glow: 0xd4fbf5,
    line: 0x76d9df,
    surface: 0x1a3341,
    mist: 0xa8e6ea
  },
  stillness: {
    accent: 0xb6c9de,
    glow: 0xf1f5f9,
    line: 0x93a5bb,
    surface: 0x1a242d,
    mist: 0xe1e8ef
  }
});

export const WORLD_LAYOUT = Object.freeze({
  islands: [
    { x: 780, y: 2210, w: 960, h: 288, r: 98, alpha: 0.18 },
    { x: 550, y: 1780, w: 500, h: 182, r: 66, alpha: 0.15 },
    { x: 1045, y: 1700, w: 526, h: 184, r: 66, alpha: 0.15 },
    { x: 780, y: 1355, w: 650, h: 190, r: 78, alpha: 0.14 },
    { x: 1175, y: 1110, w: 360, h: 148, r: 56, alpha: 0.12 },
    { x: 385, y: 1115, w: 340, h: 140, r: 56, alpha: 0.12 },
    { x: 770, y: 790, w: 470, h: 152, r: 60, alpha: 0.12 }
  ],
  monoliths: [
    { x: 290, y: 1950, w: 44, h: 176, alpha: 0.08 },
    { x: 1250, y: 1900, w: 54, h: 196, alpha: 0.08 },
    { x: 1030, y: 1250, w: 42, h: 146, alpha: 0.07 },
    { x: 520, y: 950, w: 40, h: 136, alpha: 0.07 },
    { x: 860, y: 670, w: 38, h: 128, alpha: 0.065 }
  ],
  ambientRings: [
    { x: 770, y: 2160, r: 256, a: 0.026 },
    { x: 555, y: 1490, r: 194, a: 0.022 },
    { x: 1045, y: 1350, r: 184, a: 0.02 },
    { x: 770, y: 790, r: 164, a: 0.018 }
  ]
});

export const CHARACTER_LAYOUT = Object.freeze([
  { id: 'shore', x: 470, y: 2010 },
  { id: 'crossing', x: 1065, y: 1995 },
  { id: 'listen', x: 470, y: 1585 },
  { id: 'between', x: 1050, y: 1500 },
  { id: 'height', x: 1180, y: 1120 },
  { id: 'return', x: 760, y: 835 }
]);

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
  return mode === MODES.CONNECTION
    ? CAMERA.lerpConnection
    : CAMERA.lerpStillness;
}

export function getOverlayRoot() {
  return document.getElementById('overlay-root');
}

export function shuffle(array) {
  const cloned = [...array];

  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }

  return cloned;
}
