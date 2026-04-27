import { GAME_CONFIG } from './game.js';
import { BootScene } from './scenes/BootScene.js';
import { ModeSelectScene } from './scenes/ModeSelectScene.js';
import { GameScene } from './scenes/GameScene.js';
import { MessageScene } from './scenes/MessageScene.js';

function createGame() {
  const config = {
    type: Phaser.AUTO,
    parent: 'game-root',
    width: GAME_CONFIG.baseWidth,
    height: GAME_CONFIG.baseHeight,
    backgroundColor: GAME_CONFIG.backgroundColor,
    render: {
      antialias: true,
      pixelArt: false,
      powerPreference: 'high-performance',
      clearBeforeRender: true,
      transparent: false
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_CONFIG.baseWidth,
      height: GAME_CONFIG.baseHeight
    },
    input: {
      activePointers: 4,
      smoothFactor: 0.14
    },
    scene: [BootScene, ModeSelectScene, GameScene, MessageScene]
  };

  return new Phaser.Game(config);
}

function bootWhenReady() {
  if (window.Phaser) {
    createGame();
    return;
  }

  window.addEventListener(
    'load',
    () => {
      createGame();
    },
    { once: true }
  );
}

bootWhenReady();
