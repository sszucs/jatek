import { getOverlayRoot } from '../game.js';

export class HUD {
  constructor() {
    this.root = null;
    this.layers = new Map();
  }

  mount() {
    const host = getOverlayRoot();

    if (!host) {
      throw new Error('Overlay root was not found.');
    }

    host.innerHTML = '';

    this.root = document.createElement('div');
    this.root.className = 'hud-root';

    const messageLayer = document.createElement('div');
    messageLayer.className = 'hud-layer hud-layer-message';

    this.root.appendChild(messageLayer);
    host.appendChild(this.root);

    this.layers.set('message', messageLayer);
  }

  getLayer(name) {
    return this.layers.get(name);
  }

  refresh() {
    if (!this.root) return;

    this.root.style.setProperty('--safe-top', 'env(safe-area-inset-top, 0px)');
    this.root.style.setProperty('--safe-right', 'env(safe-area-inset-right, 0px)');
    this.root.style.setProperty('--safe-bottom', 'env(safe-area-inset-bottom, 0px)');
    this.root.style.setProperty('--safe-left', 'env(safe-area-inset-left, 0px)');
  }
}
