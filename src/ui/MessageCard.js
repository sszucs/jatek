import { MODES } from '../game.js';

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export class MessageCard {
  constructor() {
    this.root = null;
    this.veil = null;
    this.card = null;
    this.textNode = null;
    this.mounted = false;
  }

  mount(parent) {
    if (!parent) {
      throw new Error('MessageCard requires a parent element.');
    }

    this.root = document.createElement('div');
    this.root.className = 'message-presence';

    this.veil = document.createElement('div');
    this.veil.className = 'message-presence__veil';

    this.card = document.createElement('div');
    this.card.className = 'message-card';

    this.textNode = document.createElement('p');
    this.textNode.className = 'message-card__text';

    this.card.appendChild(this.textNode);
    this.root.appendChild(this.veil);
    this.root.appendChild(this.card);
    parent.appendChild(this.root);

    this.mounted = true;
  }

  setPosition(anchor, layout) {
    if (!this.card) return;

    this.card.style.left = `${anchor.x}px`;
    this.card.style.top = `${anchor.y}px`;
    this.card.dataset.layout = layout;
  }

  async present({ text, mode, layout, anchor, fadeInMs, holdMs, fadeOutMs }) {
    if (!this.mounted || !this.root || !this.card || !this.textNode) return;

    this.textNode.textContent = text;
    this.card.dataset.mode = mode === MODES.CONNECTION ? 'connection' : 'stillness';
    this.card.dataset.layout = layout;
    this.setPosition(anchor, layout);

    this.root.style.setProperty('--fade-in-ms', `${fadeInMs}ms`);
    this.root.style.setProperty('--fade-out-ms', `${fadeOutMs}ms`);

    this.root.classList.remove('is-visible', 'is-hidden');
    this.root.classList.add('is-preparing');

    await wait(24);

    this.root.classList.remove('is-preparing', 'is-hidden');
    this.root.classList.add('is-visible');

    await wait(fadeInMs + holdMs);

    this.root.classList.remove('is-visible');
    this.root.classList.add('is-hidden');

    await wait(fadeOutMs + 40);

    this.root.classList.remove('is-hidden');
  }
}
