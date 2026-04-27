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
    };

    this.scale.on('resize', this.resizeHandler);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.resizeHandler) {
        this.scale.off('resize', this.resizeHandler);
        this.resizeHandler = null;
      }
    });
  }

  async present({ text, mode, anchor }) {
    if (this.presenting) {
      return;
    }

    this.presenting = true;
    this.registry.set('activeMessage', text);

    const layout = mode === MODES.CONNECTION ? 'between' : 'presence';

    await this.messageCard.present({
      text,
      mode,
      layout,
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

    const exitNotes = this.registry.get('exitNotes') || [];
    const note = exitNotes[0];

    if (!note?.text) return;

    this.present({
      text: note.text,
      mode: MODES.STILLNESS,
      anchor: {
        x: this.scale.gameSize.width * 0.5,
        y: this.scale.gameSize.height * 0.46
      }
    });
  }
}
