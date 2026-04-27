import {
  COLORS,
  MODES,
  SCENES,
  TIMINGS,
  easeInOutSine
} from '../game.js';

export class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MODE_SELECT);
    this.cards = [];
    this.selected = null;
    this.connectionPreview = null;
    this.stillnessPreview = null;
    this.backdropGraphics = null;
    this.topGlow = null;
    this.bottomGlow = null;
    this.subtitle = null;
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d1520');
    this.buildBackdrop();
    this.buildCards();
    this.beginAtmosphere();
  }

  buildBackdrop() {
    const { width, height } = this.scale;

    this.backdropGraphics = this.add.graphics();
    this.drawBackdrop();

    this.topGlow = this.add.circle(width * 0.52, height * 0.18, 225, 0xffffff, 0.045);
    this.bottomGlow = this.add.circle(width * 0.5, height * 0.88, 285, 0x87c8da, 0.04);

    this.subtitle = this.add
      .text(
        width * 0.5,
        height * 0.14,
        'Choose the way the world will answer you.',
        {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '16px',
          color: '#dbe7ee',
          align: 'center',
          wordWrap: { width: width * 0.8 }
        }
      )
      .setOrigin(0.5)
      .setAlpha(0.86);
  }

  drawBackdrop() {
    const { width, height } = this.scale;
    const g = this.backdropGraphics;
    g.clear();

    const steps = 18;
    for (let i = 0; i < steps; i += 1) {
      const t = i / (steps - 1);
      const eased = easeInOutSine(t);
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(COLORS.worldTop),
        Phaser.Display.Color.ValueToColor(COLORS.worldBottom),
        1,
        eased
      );

      g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
      g.fillRect(0, (height / steps) * i, width, height / steps + 2);
    }
  }

  buildCards() {
    const options = this.registry.get('modeOptions') || [];
    const connectionOption = options.find((option) => option.id === MODES.CONNECTION);
    const stillnessOption = options.find((option) => option.id === MODES.STILLNESS);

    const { width, height } = this.scale;
    const cardWidth = width * 0.8;
    const cardHeight = 188;
    const centerX = width * 0.5;
    const topY = height * 0.38;
    const gap = 218;

    const connectionCard = this.createCard({
      x: centerX,
      y: topY,
      width: cardWidth,
      height: cardHeight,
      title: connectionOption?.title || '',
      body: connectionOption?.body || '',
      mode: MODES.CONNECTION
    });

    const stillnessCard = this.createCard({
      x: centerX,
      y: topY + gap,
      width: cardWidth,
      height: cardHeight,
      title: stillnessOption?.title || '',
      body: stillnessOption?.body || '',
      mode: MODES.STILLNESS
    });

    this.cards.push(connectionCard, stillnessCard);
  }

  createCard({ x, y, width, height, title, body, mode }) {
    const container = this.add.container(x, y);
    container.mode = mode;
    container.baseY = y;

    const shadow = this.add
      .rectangle(0, 14, width, height, 0x000000, 0.17)
      .setOrigin(0.5);

    const surface = this.add.graphics();
    this.drawCardSurface(surface, width, height, mode);

    const titleNode = this.add
      .text(-width * 0.37, -height * 0.18, title, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '22px',
        color: '#f4f8fb',
        wordWrap: {
          width: width * 0.66,
          useAdvancedWrap: true
        }
      })
      .setOrigin(0, 0.5);

    const bodyNode = this.add
      .text(-width * 0.37, height * 0.12, body, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        color: '#cfdee8',
        lineSpacing: 6,
        wordWrap: {
          width: width * 0.68,
          useAdvancedWrap: true
        }
      })
      .setOrigin(0, 0.5)
      .setAlpha(0.92);

    const preview = this.add.graphics();
    preview.setPosition(width * 0.25, 0);

    container.add([shadow, surface, preview, titleNode, bodyNode]);

    container.setSize(width, height);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    container.on('pointerover', () => {
      if (this.selected) return;
      this.tweens.add({
        targets: container,
        y: container.baseY - 4,
        duration: 900,
        ease: 'Sine.easeInOut'
      });
    });

    container.on('pointerout', () => {
      if (this.selected) return;
      this.tweens.add({
        targets: container,
        y: container.baseY,
        duration: 1100,
        ease: 'Sine.easeInOut'
      });
    });

    container.on('pointerdown', () => {
      if (this.selected) return;
      this.commitSelection(mode);
    });

    if (mode === MODES.CONNECTION) {
      this.connectionPreview = preview;
    } else {
      this.stillnessPreview = preview;
    }

    return container;
  }

  drawCardSurface(graphics, width, height, mode) {
    const accent = mode === MODES.CONNECTION ? 0x7ad6dd : 0xb7c7dd;

    graphics.clear();
    graphics.fillStyle(0xffffff, 0.058);
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 28);

    graphics.fillStyle(0xffffff, 0.024);
    graphics.fillRoundedRect(-width / 2 + 1, -height / 2 + 1, width - 2, height - 2, 28);

    graphics.lineStyle(1.35, 0xffffff, 0.18);
    graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 28);

    graphics.lineStyle(1, accent, 0.13);
    graphics.strokeRoundedRect(-width / 2 + 6, -height / 2 + 6, width - 12, height - 12, 24);

    graphics.fillStyle(accent, 0.03);
    graphics.fillCircle(width * 0.26, -height * 0.17, 44);
  }

  beginAtmosphere() {
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        this.updateConnectionPreview();
        this.updateStillnessPreview();
      }
    });

    this.tweens.add({
      targets: this.topGlow,
      alpha: { from: 0.04, to: 0.08 },
      scaleX: { from: 0.96, to: 1.04 },
      scaleY: { from: 0.96, to: 1.04 },
      duration: 5200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: this.bottomGlow,
      alpha: { from: 0.028, to: 0.06 },
      scaleX: { from: 0.98, to: 1.02 },
      scaleY: { from: 0.98, to: 1.02 },
      duration: 6900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  updateConnectionPreview() {
    if (!this.connectionPreview) return;

    const t = this.time.now * 0.001;
    const g = this.connectionPreview;

    const points = [
      { x: -35 + Math.sin(t * 0.72) * 4.5, y: -30 + Math.cos(t * 0.84) * 3.5 },
      { x: 18 + Math.sin(t * 0.95 + 1.2) * 3, y: -10 + Math.cos(t * 1.1 + 0.2) * 3 },
      { x: -6 + Math.sin(t * 0.78 + 2.2) * 4, y: 30 + Math.cos(t * 0.64 + 1.1) * 4 }
    ];

    g.clear();
    g.lineStyle(1.3, 0x81d8de, 0.34);
    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    g.lineTo(points[1].x, points[1].y);
    g.lineTo(points[2].x, points[2].y);
    g.strokePath();

    points.forEach((point, index) => {
      const pulse = 7 + Math.sin(t * 1.15 + index * 1.4) * 1.2;
      g.fillStyle(0xbef4f1, 0.14);
      g.fillCircle(point.x, point.y, pulse);
      g.fillStyle(0xe8fffb, 0.88);
      g.fillCircle(point.x, point.y, 2.6);
    });
  }

  updateStillnessPreview() {
    if (!this.stillnessPreview) return;

    const t = this.time.now * 0.001;
    const g = this.stillnessPreview;
    const breath = 24 + Math.sin(t * 0.3) * 1.05;

    g.clear();
    g.lineStyle(1, 0xc7d5e7, 0.17);
    g.strokeCircle(0, 0, breath);
    g.fillStyle(0xe9f0f7, 0.07);
    g.fillCircle(0, 0, breath * 0.76);
    g.fillStyle(0xffffff, 0.82);
    g.fillCircle(0, 0, 3.8);
  }

  commitSelection(mode) {
    this.selected = mode;
    this.input.enabled = false;
    this.registry.set('mode', mode);

    const selectedCard = this.cards.find((card) => card.mode === mode);
    const otherCard = this.cards.find((card) => card.mode !== mode);

    this.tweens.add({
      targets: selectedCard,
      scaleX: 1.018,
      scaleY: 1.018,
      alpha: 1,
      duration: TIMINGS.selectionCommitMs,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: otherCard,
      alpha: 0.22,
      y: otherCard.baseY + 16,
      duration: TIMINGS.selectionCommitMs - 260,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: [this.subtitle, this.topGlow, this.bottomGlow],
      alpha: 0.12,
      duration: TIMINGS.selectionCommitMs,
      ease: 'Sine.easeInOut'
    });

    this.time.delayedCall(TIMINGS.selectionCommitMs, () => {
      this.scene.start(SCENES.GAME);
    });
  }
}
