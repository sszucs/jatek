import { MODE_DESCRIPTIONS, MODES, SCENES, getOverlayRoot, shuffle } from '../game.js';
import { messages } from '../../assets/data/messages.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create() {
    const overlayRoot = getOverlayRoot();
    if (overlayRoot) {
      overlayRoot.innerHTML = '';
    }

    const sessionMessageQueue = shuffle(messages.map((message) => message.id));

    this.registry.set('mode', null);
    this.registry.set('sessionMessageQueue', sessionMessageQueue);
    this.registry.set('sessionMessagesUsed', []);
    this.registry.set('encounteredCharacters', []);
    this.registry.set('activeMessage', null);
    this.registry.set('worldSettled', false);
    this.registry.set('modeOptions', [
      {
        id: MODES.CONNECTION,
        title: MODE_DESCRIPTIONS[MODES.CONNECTION].title,
        body: MODE_DESCRIPTIONS[MODES.CONNECTION].body
      },
      {
        id: MODES.STILLNESS,
        title: MODE_DESCRIPTIONS[MODES.STILLNESS].title,
        body: MODE_DESCRIPTIONS[MODES.STILLNESS].body
      }
    ]);

    this.scene.start(SCENES.MODE_SELECT);
  }
}
