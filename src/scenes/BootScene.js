import { SCENES, getOverlayRoot, shuffle } from '../game.js';
import { messages, modeOptions, exitNotes } from '../../assets/data/messages.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create() {
    const overlayRoot = getOverlayRoot();

    if (overlayRoot) {
      overlayRoot.innerHTML = '';
    }

    const shuffledMessageIds = shuffle(messages.map((message) => message.id));

    this.registry.set('mode', null);
    this.registry.set('sessionMessageQueue', shuffledMessageIds);
    this.registry.set('sessionMessagesUsed', []);
    this.registry.set('encounteredCharacters', []);
    this.registry.set('activeMessage', null);
    this.registry.set('worldSettled', false);
    this.registry.set('modeOptions', modeOptions);
    this.registry.set('exitNotes', exitNotes);

    this.scene.start(SCENES.MODE_SELECT);
  }
}
