import { MODES, SCENES, TIMINGS } from '../game.js';
import { HUD } from '../ui/HUD.js';
import { MessageCard } from '../ui/MessageCard.js';

export class MessageScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MESSAGE);
    this.hud = null;
    this.messageCard = null;
    this.presenting = false;
    this.resizeHandler = null;
  }

  create() {
    this.hud = new HUD();
    this.hud.mount();
    this.hud.refresh();

    this.messageCard = new MessageCard();
    this.messageCard.mount(this.hud.getLayer('message'));

    this.resizeHandler = () => {
      this.hud.refresh();
      this.messageCard.refreshPosition();
    };

    this.scale.on('resize', this.resizeHandler);
    window.addEventListener('resize', this.resizeHandler);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.teardown, this);
  }

  async present({ text, mode, anchor }) {
    if (this.presenting) {
      return;
    }

    this.presenting = true;
    this.registry.set('activeMessage', text);

    await this.messageCard.present({
      text,
      mode,
      layout: mode === MODES.CONNECTION ? 'between' : 'presence',
      anchor,
      fadeInMs: TIMINGS.messageFadeInMs,
      holdMs: TIMINGS.messageHoldMs,
      fadeOutMs: TIMINGS.messageFadeOutMs
    });

    this.registry.set('activeMessage', null);
    this.presenting = false;
  }

  offerExitNote() {
    if (this.presenting) return;
    if (Math.random() > 0.12) return;

    this.present({
      text: 'Take what you received with you.',
      mode: MODES.STILLNESS,
      anchor: {
        x: this.scale.gameSize.width * 0.5,
        y: this.scale.gameSize.height * 0.46
      }
    });
  }

  teardown() {
    if (this.resizeHandler) {
      this.scale.off('resize', this.resizeHandler);
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }
}
