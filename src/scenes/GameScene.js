import {
  CAMERA,
  CHARACTER_LAYOUT,
  COLORS,
  MODES,
  PLAYER,
  SCENES,
  TIMINGS,
  WORLD,
  WORLD_LAYOUT,
  clamp,
  getCameraLerp,
  getModePalette,
  getMoveConfig,
  lerp
} from '../game.js';
import { messages } from '../../assets/data/messages.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME);

    this.mode = MODES.CONNECTION;
    this.player = null;
    this.characters = [];
    this.backdropGraphics = null;
    this.ambientGraphics = null;
    this.islandGraphics = null;
    this.monolithGraphics = null;
    this.connectionGraphics = null;
    this.settledConnectionGraphics = null;
    this.worldGlow = null;
    this.worldSettling = false;
    this.isInterrupted = false;
    this.canMove = false;
    this.entryLockUntil = 0;

    this.dragActive = false;
    this.dragStart = new Phaser.Math.Vector2(0, 0);
    this.dragVector = new Phaser.Math.Vector2(0, 0);
    this.keyboardVector = new Phaser.Math.Vector2(0, 0);
    this.desiredVector = new Phaser.Math.Vector2(0, 0);
    this.motionVector = new Phaser.Math.Vector2(0, 0);

    this.keys = null;
    this.visibilityHandler = null;
  }

  create() {
    this.mode = this.registry.get('mode') || MODES.CONNECTION;
    this.cameras.main.setBackgroundColor('#0c131b');
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);

    this.buildWorld();
    this.buildPlayer();
    this.buildCharacters();
    this.setupCamera();
    this.setupInput();
    this.setupMessageScene();
    this.setupVisibilityHandling();
    this.beginEntryLock();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.onShutdown, this);
  }

  buildWorld() {
    const palette = getModePalette(this.mode);

    this.backdropGraphics = this.add.graphics();
    this.drawBackdrop();

    this.worldGlow = this.add.circle(
      WORLD.width * 0.5,
      WORLD.height * 0.14,
      300,
      palette.accent,
      this.mode === MODES.CONNECTION ? 0.058 : 0.026
    );

    this.ambientGraphics = this.add.graphics();
    WORLD_LAYOUT.ambientRings.forEach((ring) => {
      this.ambientGraphics.lineStyle(1, palette.line, ring.a);
      this.ambientGraphics.strokeCircle(ring.x, ring.y, ring.r);
    });

    this.islandGraphics = this.add.graphics();
    WORLD_LAYOUT.islands.forEach((island) => {
      this.islandGraphics.fillStyle(palette.surface, island.alpha);
      this.islandGraphics.fillRoundedRect(
        island.x - island.w / 2,
        island.y - island.h / 2,
        island.w,
        island.h,
        island.r
      );

      this.islandGraphics.lineStyle(1, 0xffffff, 0.038);
      this.islandGraphics.strokeRoundedRect(
        island.x - island.w / 2,
        island.y - island.h / 2,
        island.w,
        island.h,
        island.r
      );
    });

    this.monolithGraphics = this.add.graphics();
    WORLD_LAYOUT.monoliths.forEach((stone) => {
      this.monolithGraphics.fillStyle(0xffffff, stone.alpha);
      this.monolithGraphics.fillRoundedRect(
        stone.x - stone.w / 2,
        stone.y - stone.h / 2,
        stone.w,
        stone.h,
        14
      );
    });

    this.settledConnectionGraphics = this.add.graphics();
    this.connectionGraphics = this.add.graphics();

    this.buildAtmosphereTweens();
  }

  drawBackdrop() {
    const g = this.backdropGraphics;
    g.clear();

    const steps = 24;
    for (let index = 0; index < steps; index += 1) {
      const t = index / (steps - 1);
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(COLORS.worldTop),
        Phaser.Display.Color.ValueToColor(COLORS.worldBottom),
        1,
        t
      );

      g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
      g.fillRect(0, (WORLD.height / steps) * index, WORLD.width, WORLD.height / steps + 4);
    }
  }

  buildAtmosphereTweens() {
    if (this.mode === MODES.CONNECTION) {
      this.tweens.add({
        targets: this.worldGlow,
        alpha: { from: 0.04, to: 0.085 },
        scaleX: { from: 0.98, to: 1.03 },
        scaleY: { from: 0.98, to: 1.03 },
        duration: 5200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.tweens.add({
        targets: this.ambientGraphics,
        alpha: { from: 0.72, to: 1 },
        duration: 4800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      this.tweens.add({
        targets: this.worldGlow,
        alpha: { from: 0.02, to: 0.034 },
        duration: 9600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  buildPlayer() {
    const startX = WORLD.width * 0.5;
    const startY = WORLD.height * 0.89;
    const palette = getModePalette(this.mode);

    this.player = this.add.container(startX, startY);
    this.player.velocity = new Phaser.Math.Vector2(0, 0);
    this.player.radius = WORLD.playerRadius;

    this.player.aura = this.add.circle(0, 0, 28, palette.glow, this.mode === MODES.CONNECTION ? 0.15 : 0.1);
    this.player.body = this.add.circle(0, 0, WORLD.playerRadius, 0xffffff, 0.92);
    this.player.core = this.add.circle(0, 0, 6, palette.accent, 0.86);

    this.player.add([this.player.aura, this.player.body, this.player.core]);
  }

  buildCharacters() {
    const encounteredIds = new Set(this.registry.get('encounteredCharacters') || []);
    const palette = getModePalette(this.mode);

    this.characters = CHARACTER_LAYOUT.map((entry, index) => {
      const container = this.add.container(entry.x, entry.y);
      container.id = entry.id;
      container.encountered = encounteredIds.has(entry.id);
      container.setDepth(2);

      container.aura = this.add.circle(
        0,
        0,
        34,
        palette.glow,
        container.encountered ? 0.06 : this.mode === MODES.CONNECTION ? 0.11 : 0.075
      );
      container.ring = this.add.circle(
        0,
        0,
        WORLD.characterRadius + 6,
        palette.accent,
        container.encountered ? 0.045 : 0.08
      );
      container.ring.setStrokeStyle(
        1.1,
        palette.accent,
        container.encountered ? 0.14 : this.mode === MODES.CONNECTION ? 0.28 : 0.18
      );
      container.body = this.add.circle(
        0,
        0,
        WORLD.characterRadius,
        0xffffff,
        container.encountered ? 0.48 : 0.72
      );

      container.add([container.aura, container.ring, container.body]);

      if (!container.encountered) {
        this.tweens.add({
          targets: [container.aura, container.ring],
          alpha: {
            from: this.mode === MODES.CONNECTION ? 0.08 : 0.05,
            to: this.mode === MODES.CONNECTION ? 0.16 : 0.1
          },
          scaleX: { from: 0.985, to: 1.03 },
          scaleY: { from: 0.985, to: 1.03 },
          duration: this.mode === MODES.CONNECTION ? 3600 + index * 260 : 7200 + index * 420,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      return container;
    });
  }

  setupCamera() {
    const cameraLerp = getCameraLerp(this.mode);
    this.cameras.main.startFollow(this.player, true, cameraLerp, cameraLerp);
    this.cameras.main.setZoom(CAMERA.zoom);
    this.cameras.main.setDeadzone(CAMERA.deadzoneWidth, CAMERA.deadzoneHeight);
  }

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      this.dragActive = true;
      this.dragStart.set(pointer.x, pointer.y);
      this.dragVector.set(0, 0);
    });

    this.input.on('pointermove', (pointer) => {
      if (!this.dragActive || !this.canMove || this.isInterrupted || this.worldSettling) {
        return;
      }

      const dx = pointer.x - this.dragStart.x;
      const dy = pointer.y - this.dragStart.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= PLAYER.dragDeadZone) {
        this.dragVector.set(0, 0);
        return;
      }

      this.dragVector.set(dx / distance, dy / distance);
    });

    this.input.on('pointerup', () => {
      this.dragActive = false;
      this.dragVector.set(0, 0);
    });

    this.input.on('pointerupoutside', () => {
      this.dragActive = false;
      this.dragVector.set(0, 0);
    });

    this.keys = this.input.keyboard?.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
      upAlt: 'UP',
      downAlt: 'DOWN',
      leftAlt: 'LEFT',
      rightAlt: 'RIGHT'
    });
  }

  setupMessageScene() {
    if (!this.scene.isActive(SCENES.MESSAGE)) {
      this.scene.launch(SCENES.MESSAGE);
    }
  }

  setupVisibilityHandling() {
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.beginWorldSettle();
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  beginEntryLock() {
    this.canMove = false;
    this.entryLockUntil = this.time.now + TIMINGS.entryLockMs;

    if (this.mode === MODES.CONNECTION) {
      this.connectionGraphics.alpha = 0;
      this.tweens.add({
        targets: this.connectionGraphics,
        alpha: 1,
        duration: TIMINGS.entryLockMs,
        ease: 'Sine.easeInOut'
      });
    } else {
      this.connectionGraphics.alpha = 0;
      this.settledConnectionGraphics.alpha = 0;
    }

    this.time.delayedCall(TIMINGS.entryLockMs, () => {
      this.canMove = true;
    });
  }

  update() {
    this.updateKeyboardVector();
    this.updateMovement();
    this.updatePlayerVisuals();
    this.updateAtmosphere();
    this.checkEncounters();
  }

  updateKeyboardVector() {
    if (!this.keys) {
      this.keyboardVector.set(0, 0);
      return;
    }

    const x =
      (this.keys.right?.isDown || this.keys.rightAlt?.isDown ? 1 : 0) +
      (this.keys.left?.isDown || this.keys.leftAlt?.isDown ? -1 : 0);

    const y =
      (this.keys.down?.isDown || this.keys.downAlt?.isDown ? 1 : 0) +
      (this.keys.up?.isDown || this.keys.upAlt?.isDown ? -1 : 0);

    this.keyboardVector.set(x, y);
    if (this.keyboardVector.lengthSq() > 0) {
      this.keyboardVector.normalize();
    }
  }

  updateMovement() {
    const moveConfig = getMoveConfig(this.mode);
    const canMove =
      this.canMove &&
      this.time.now >= this.entryLockUntil &&
      !this.isInterrupted &&
      !this.worldSettling;

    this.desiredVector.set(0, 0);

    if (canMove) {
      if (this.dragVector.lengthSq() > 0) {
        this.desiredVector.copy(this.dragVector);
      } else if (this.keyboardVector.lengthSq() > 0) {
        this.desiredVector.copy(this.keyboardVector);
      }
    }

    const desiredVelocity = this.desiredVector.clone().scale(moveConfig.speed);
    const lerpAmount = desiredVelocity.lengthSq() > 0 ? moveConfig.accel : moveConfig.decel;

    this.motionVector.x = lerp(this.motionVector.x, desiredVelocity.x, lerpAmount);
    this.motionVector.y = lerp(this.motionVector.y, desiredVelocity.y, lerpAmount);

    const delta = Math.min(this.game.loop.delta / 1000, 0.05);

    this.player.x = clamp(
      this.player.x + this.motionVector.x * delta,
      WORLD.boundaryPaddingX,
      WORLD.width - WORLD.boundaryPaddingX
    );

    this.player.y = clamp(
      this.player.y + this.motionVector.y * delta,
      WORLD.boundaryPaddingY,
      WORLD.height - WORLD.boundaryPaddingY
    );
  }

  updatePlayerVisuals() {
    const moveConfig = getMoveConfig(this.mode);
    const strength = Math.min(1, this.motionVector.length() / moveConfig.speed);

    this.player.aura.scale = 1 + strength * (this.mode === MODES.CONNECTION ? 0.07 : 0.035);
    this.player.aura.alpha =
      this.mode === MODES.CONNECTION ? 0.13 + strength * 0.05 : 0.095 + strength * 0.02;
    this.player.body.scale = 1 + strength * 0.022;
    this.player.core.scale = 1 + strength * 0.04;
  }

  updateAtmosphere() {
    if (this.mode === MODES.CONNECTION) {
      this.drawLivingConnections();
      this.drawSettledConnections();
    } else {
      this.connectionGraphics.clear();
      this.settledConnectionGraphics.clear();
    }
  }

  drawLivingConnections() {
    const palette = getModePalette(this.mode);
    const g = this.connectionGraphics;
    const t = this.time.now * 0.001;

    g.clear();

    this.characters.forEach((character, index) => {
      if (character.encountered) return;

      const distanceToPlayer = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        character.x,
        character.y
      );

      if (distanceToPlayer <= 520) {
        const alpha = Phaser.Math.Linear(0.02, 0.15, 1 - distanceToPlayer / 520);
        const wave = 0.85 + Math.sin(t * 1.1 + index * 0.7) * 0.12;

        g.lineStyle(1.05, palette.line, alpha * wave);
        g.beginPath();
        g.moveTo(this.player.x, this.player.y);
        g.lineTo(character.x, character.y);
        g.strokePath();
      }
    });

    for (let index = 0; index < this.characters.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < this.characters.length; nextIndex += 1) {
        const a = this.characters[index];
        const b = this.characters[nextIndex];
        if (a.encountered && b.encountered) continue;

        const distance = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
        if (distance > 620) continue;

        const alphaBase = Phaser.Math.Linear(0.018, 0.085, 1 - distance / 620);
        const alpha = alphaBase * (0.82 + Math.sin(t * 0.62 + index * 0.52 + nextIndex * 0.4) * 0.1);

        g.lineStyle(1, palette.line, alpha);
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.strokePath();
      }
    }
  }

  drawSettledConnections() {
    const palette = getModePalette(this.mode);
    const g = this.settledConnectionGraphics;
    const encountered = this.characters.filter((character) => character.encountered);

    g.clear();
    if (encountered.length < 2) return;

    for (let index = 0; index < encountered.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < encountered.length; nextIndex += 1) {
        const a = encountered[index];
        const b = encountered[nextIndex];
        const distance = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
        if (distance > 920) continue;

        const alpha = Phaser.Math.Linear(0.02, 0.07, 1 - distance / 920);
        g.lineStyle(1, palette.line, alpha);
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.strokePath();
      }
    }
  }

  checkEncounters() {
    if (!this.canMove || this.isInterrupted || this.worldSettling) return;

    for (const character of this.characters) {
      if (character.encountered) continue;

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        character.x,
        character.y
      );

      if (distance <= WORLD.encounterRadius) {
        this.beginEncounter(character);
        break;
      }
    }
  }

  beginEncounter(character) {
    this.isInterrupted = true;
    this.dragActive = false;
    this.dragVector.set(0, 0);
    this.keyboardVector.set(0, 0);
    this.desiredVector.set(0, 0);

    const payload = this.getNextMessage();
    const messageScene = this.scene.get(SCENES.MESSAGE);

    if (!payload || !messageScene?.present) {
      this.completeEncounter(character);
      return;
    }

    const anchor = this.getMessageAnchor(character);

    this.tweens.add({
      targets: [this.player.aura, character.aura],
      alpha: this.mode === MODES.CONNECTION ? 0.18 : 0.12,
      duration: 440,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    messageScene.present({
      text: payload.text,
      mode: this.mode,
      anchor,
      characterId: character.id
    }).then(() => {
      this.completeEncounter(character);
    });
  }

  completeEncounter(character) {
    character.encountered = true;
    const palette = getModePalette(this.mode);

    character.body.setFillStyle(0xffffff, 0.48);
    character.ring.setStrokeStyle(1, palette.accent, this.mode === MODES.CONNECTION ? 0.14 : 0.11);
    character.aura.setFillStyle(palette.glow, this.mode === MODES.CONNECTION ? 0.065 : 0.05);

    const encounteredCharacters = [...(this.registry.get('encounteredCharacters') || [])];
    if (!encounteredCharacters.includes(character.id)) {
      encounteredCharacters.push(character.id);
      this.registry.set('encounteredCharacters', encounteredCharacters);
    }

    this.time.delayedCall(TIMINGS.releaseSettleMs, () => {
      this.isInterrupted = false;
    });
  }

  getNextMessage() {
    const queue = [...(this.registry.get('sessionMessageQueue') || [])];
    const used = [...(this.registry.get('sessionMessagesUsed') || [])];
    let nextId = queue.shift();

    if (!nextId) {
      const remaining = messages.map((message) => message.id).filter((id) => !used.includes(id));
      nextId = remaining[0] || messages[0]?.id || null;
    }

    if (!nextId) return null;

    const next = messages.find((message) => message.id === nextId) || null;
    if (!next) return null;

    if (!used.includes(next.id)) {
      used.push(next.id);
    }

    this.registry.set('sessionMessageQueue', queue);
    this.registry.set('sessionMessagesUsed', used);
    return next;
  }

  getMessageAnchor(character) {
    if (this.mode === MODES.STILLNESS) {
      return {
        x: this.scale.gameSize.width * 0.5,
        y: this.scale.gameSize.height * 0.445
      };
    }

    const camera = this.cameras.main;
    const x = ((this.player.x + character.x) * 0.5 - camera.worldView.x) * camera.zoom;
    const y = ((this.player.y + character.y) * 0.5 - camera.worldView.y) * camera.zoom;

    return {
      x: clamp(x, 66, this.scale.gameSize.width - 66),
      y: clamp(y, 180, this.scale.gameSize.height - 244)
    };
  }

  beginWorldSettle() {
    if (this.worldSettling) return;

    this.worldSettling = true;
    this.registry.set('worldSettled', true);

    this.tweens.add({
      targets: [
        this.worldGlow,
        this.connectionGraphics,
        this.settledConnectionGraphics,
        this.ambientGraphics
      ],
      alpha: 0.08,
      duration: TIMINGS.worldSettleOnHideMs,
      ease: 'Sine.easeInOut'
    });

    const messageScene = this.scene.get(SCENES.MESSAGE);
    if (messageScene?.offerExitNote) {
      messageScene.offerExitNote();
    }
  }

  onShutdown() {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }
}
