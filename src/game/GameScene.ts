import Phaser from 'phaser';
import { levels, type LevelConfig } from './levels';
import SoundManager from './SoundManager';

type GState = 'IDLE' | 'AIMING' | 'FLYING' | 'SCORED' | 'MISSED' | 'GAME_OVER';

export default class GameScene extends Phaser.Scene {
  private ball!: Phaser.Physics.Arcade.Sprite;
  private rimL!: Phaser.Physics.Arcade.Sprite;
  private rimR!: Phaser.Physics.Arcade.Sprite;
  private bb!: Phaser.Physics.Arcade.Sprite;

  private hoopGfx!: Phaser.GameObjects.Graphics;
  private aimGfx!: Phaser.GameObjects.Graphics;
  private pwrGfx!: Phaser.GameObjects.Graphics;

  private scoreTxt!: Phaser.GameObjects.Text;
  private lvlTxt!: Phaser.GameObjects.Text;
  private attTxt!: Phaser.GameObjects.Text;
  private msgTxt!: Phaser.GameObjects.Text;
  private hintTxt!: Phaser.GameObjects.Text;
  private windTxt!: Phaser.GameObjects.Text;
  private comboTxt!: Phaser.GameObjects.Text;

  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private snd = new SoundManager();

  private st: GState = 'IDLE';
  private lvl!: LevelConfig;
  private li = 0;
  private score = 0;
  private combo = 0;
  private att = 5;
  private prevY = 0;
  private stuckT = 0;
  private hOff = 0;
  private hDir = 1;

  private readonly W = 800;
  private readonly H = 500;
  private readonly BX = 130;
  private readonly BY = 380;
  private readonly MD = 150;
  private readonly MS = 900;
  private readonly RG = 70;

  constructor() {
    super('GameScene');
  }

  create() {
    this.textures.exists('basketball') || this.mkTex();

    // Court
    const cg = this.add.graphics();
    cg.fillStyle(0x5d4037, 0.25);
    cg.fillRect(0, this.H - 50, this.W, 50);
    cg.lineStyle(2, 0x8d6e63, 0.35);
    cg.lineBetween(0, this.H - 50, this.W, this.H - 50);
    cg.lineStyle(1, 0x8d6e63, 0.15);
    cg.beginPath();
    cg.arc(this.W - 30, this.H - 50, 180, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(270));
    cg.strokePath();

    this.hoopGfx = this.add.graphics().setDepth(4);
    this.aimGfx = this.add.graphics().setDepth(8);
    this.pwrGfx = this.add.graphics().setDepth(8);

    // Ball
    this.ball = this.physics.add.sprite(this.BX, this.BY, 'basketball');
    this.ball.setBounce(0.5);
    this.ball.setDepth(5);
    (this.ball.body as Phaser.Physics.Arcade.Body).setCircle(14, 1, 1);

    // Rim bodies (invisible)
    this.rimL = this.physics.add.sprite(0, 0, 'rimTex').setAlpha(0).setDepth(3);
    this.rimR = this.physics.add.sprite(0, 0, 'rimTex').setAlpha(0).setDepth(3);
    this.bb = this.physics.add.sprite(0, 0, 'bbTex').setAlpha(0).setDepth(2);

    [this.rimL, this.rimR, this.bb].forEach(s => {
      s.setImmovable(true);
      (s.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    });
    (this.rimL.body as Phaser.Physics.Arcade.Body).setCircle(5);
    (this.rimR.body as Phaser.Physics.Arcade.Body).setCircle(5);

    this.physics.add.collider(this.ball, this.rimL, () => this.snd.bounce());
    this.physics.add.collider(this.ball, this.rimR, () => this.snd.bounce());
    this.physics.add.collider(this.ball, this.bb, () => this.snd.bounce());

    // UI text
    const hf = '"Bebas Neue", sans-serif';
    this.scoreTxt = this.add.text(this.W - 20, 15, 'SCORE: 0', {
      fontSize: '22px', fontFamily: hf, color: '#ff9800'
    }).setOrigin(1, 0).setDepth(20);

    this.lvlTxt = this.add.text(20, 15, 'LEVEL 1', {
      fontSize: '22px', fontFamily: hf, color: '#ffffff'
    }).setDepth(20);

    this.attTxt = this.add.text(this.W / 2, 15, '', {
      fontSize: '16px', fontFamily: 'sans-serif', color: '#aaaaaa', align: 'center'
    }).setOrigin(0.5, 0).setDepth(20);

    this.msgTxt = this.add.text(this.W / 2, this.H / 2 - 40, '', {
      fontSize: '48px', fontFamily: hf, color: '#ffffff', align: 'center',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setDepth(25).setAlpha(0);

    this.comboTxt = this.add.text(this.W / 2, this.H / 2 + 20, '', {
      fontSize: '24px', fontFamily: hf, color: '#ffab00', align: 'center'
    }).setOrigin(0.5).setDepth(25).setAlpha(0);

    this.hintTxt = this.add.text(this.W / 2, this.H - 20, 'Drag from the ball to aim, release to shoot!', {
      fontSize: '13px', fontFamily: 'sans-serif', color: '#666666', align: 'center'
    }).setOrigin(0.5).setDepth(20);

    this.windTxt = this.add.text(this.W / 2, 42, '', {
      fontSize: '13px', fontFamily: 'sans-serif', color: '#4fc3f7'
    }).setOrigin(0.5, 0).setDepth(20);

    // Particles
    this.emitter = this.add.particles(0, 0, 'ptTex', {
      speed: { min: 100, max: 350 },
      angle: { min: 210, max: 330 },
      scale: { start: 1.5, end: 0 },
      lifespan: 900,
      gravityY: 250,
      emitting: false,
    });
    this.emitter.setDepth(18);

    // Input
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onDown(p));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onMove(p));
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.onUp(p));

    this.loadLvl(0);
  }

  private mkTex() {
    let g = this.add.graphics();
    // Basketball
    g.fillStyle(0xef6c00); g.fillCircle(15, 15, 14);
    g.lineStyle(1.5, 0x993d00); g.strokeCircle(15, 15, 14);
    g.lineStyle(1, 0x993d00, 0.7);
    g.lineBetween(1, 15, 29, 15); g.lineBetween(15, 1, 15, 29);
    g.generateTexture('basketball', 30, 30); g.clear();
    // Rim
    g.fillStyle(0xff5722, 0.01); g.fillCircle(5, 5, 5);
    g.generateTexture('rimTex', 10, 10); g.clear();
    // Backboard
    g.fillStyle(0xffffff, 0.01); g.fillRect(0, 0, 8, 70);
    g.generateTexture('bbTex', 8, 70); g.clear();
    // Particle
    g.fillStyle(0xffab00); g.fillCircle(4, 4, 4);
    g.generateTexture('ptTex', 8, 8);
    g.destroy();
  }

  private loadLvl(i: number) {
    this.li = i;
    this.lvl = { ...levels[Math.min(i, levels.length - 1)] };
    this.att = this.lvl.attempts;
    this.hOff = 0;
    this.hDir = 1;

    const gap = this.RG * this.lvl.rimSize;
    this.rimL.setPosition(this.lvl.hoopX - gap / 2, this.lvl.hoopY);
    this.rimR.setPosition(this.lvl.hoopX + gap / 2, this.lvl.hoopY);
    this.bb.setPosition(this.lvl.hoopX + gap / 2 + 15, this.lvl.hoopY);

    this.windTxt.setText(
      this.lvl.windForce
        ? `💨 Wind ${this.lvl.windForce > 0 ? '→' : '←'} ${Math.abs(this.lvl.windForce)}`
        : ''
    );

    this.drawHoop();
    this.resetBall();
    this.updateUI();
    this.showMsg(`LEVEL ${this.lvl.level}`, '#ffffff', 1200);
    this.st = 'IDLE';
  }

  private resetBall() {
    this.ball.setPosition(this.BX, this.BY);
    this.ball.setVelocity(0, 0);
    this.ball.setAngularVelocity(0);
    this.ball.setAngle(0);
    (this.ball.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.ball.setAcceleration(0, 0);
    this.prevY = this.BY;
    this.stuckT = 0;
    this.aimGfx.clear();
    this.pwrGfx.clear();
  }

  private updateUI() {
    this.scoreTxt.setText(`SCORE: ${this.score}`);
    this.lvlTxt.setText(`LEVEL ${this.lvl.level}`);
    const d = '● '.repeat(this.att) + '○ '.repeat(this.lvl.attempts - this.att);
    this.attTxt.setText(d.trim());
  }

  /* ---- INPUT ---- */

  private onDown(p: Phaser.Input.Pointer) {
    if (this.st === 'GAME_OVER') { this.fullReset(); return; }
    if (this.st !== 'IDLE') return;
    if (Phaser.Math.Distance.Between(p.x, p.y, this.ball.x, this.ball.y) < 60) {
      this.st = 'AIMING';
    }
  }

  private onMove(p: Phaser.Input.Pointer) {
    if (this.st !== 'AIMING') return;
    const dx = this.ball.x - p.x;
    const dy = this.ball.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) return;

    const pwr = Math.min(dist, this.MD) / this.MD;
    const nx = dx / dist, ny = dy / dist;
    const vx = nx * pwr * this.MS, vy = ny * pwr * this.MS;

    this.drawTraj(vx, vy);
    this.drawPwr(pwr);

    // Elastic line
    this.aimGfx.lineStyle(2, 0xffffff, 0.25);
    this.aimGfx.lineBetween(this.ball.x, this.ball.y, p.x, p.y);
  }

  private onUp(p: Phaser.Input.Pointer) {
    if (this.st !== 'AIMING') return;
    const dx = this.ball.x - p.x;
    const dy = this.ball.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 15) { this.st = 'IDLE'; this.aimGfx.clear(); this.pwrGfx.clear(); return; }

    const pwr = Math.min(dist, this.MD) / this.MD;
    const nx = dx / dist, ny = dy / dist;
    this.launch(nx * pwr * this.MS, ny * pwr * this.MS);
  }

  /* ---- ACTIONS ---- */

  private launch(vx: number, vy: number) {
    this.st = 'FLYING';
    this.aimGfx.clear();
    this.pwrGfx.clear();
    this.hintTxt.setAlpha(0);

    const b = this.ball.body as Phaser.Physics.Arcade.Body;
    b.setAllowGravity(true);
    this.ball.setVelocity(vx, vy);
    b.setGravityY(this.lvl.gravity);
    if (this.lvl.windForce) this.ball.setAccelerationX(this.lvl.windForce * 10);
    this.prevY = this.ball.y;
  }

  private handleScore() {
    this.st = 'SCORED';
    this.combo++;
    const pts = 100 * this.combo;
    this.score += pts;

    this.snd.swish();
    this.time.delayedCall(200, () => this.snd.cheer());
    this.emitter.emitParticleAt(this.ball.x, this.ball.y, 30);
    this.cameras.main.shake(180, 0.01);

    const msgs = ['SWISH!', 'PERFECT!', 'NOTHING BUT NET!', 'CLEAN!'];
    const m = this.combo > 2 ? `${this.combo}x COMBO!` : msgs[Phaser.Math.Between(0, msgs.length - 1)];
    this.showMsg(m, '#4caf50');

    if (this.combo > 1) {
      this.comboTxt.setText(`+${pts} pts`);
      this.comboTxt.setAlpha(1);
      this.tweens.add({ targets: this.comboTxt, alpha: 0, y: this.H / 2 - 10, duration: 1200 });
    }

    this.ball.setVelocity(this.ball.body!.velocity.x * 0.2, 60);
    this.updateUI();

    this.time.delayedCall(1800, () => {
      if (this.li < levels.length - 1) {
        this.loadLvl(this.li + 1);
      } else {
        this.showMsg(`YOU WIN!\nScore: ${this.score}`, '#ffab00', 4000);
        this.st = 'GAME_OVER';
      }
    });
  }

  private handleMiss() {
    this.st = 'MISSED';
    this.combo = 0;
    this.score = Math.max(0, this.score - 10);
    this.att--;
    this.updateUI();

    this.snd.miss();
    const msgs = ['MISS!', 'SO CLOSE!', 'TRY AGAIN!', 'ALMOST!', 'NOPE!'];
    this.showMsg(msgs[Phaser.Math.Between(0, msgs.length - 1)], '#ff5252');

    this.time.delayedCall(1200, () => {
      if (this.att <= 0) {
        this.showMsg(`GAME OVER\nScore: ${this.score}`, '#ff5252', 4000);
        this.st = 'GAME_OVER';
      } else {
        this.resetBall();
        this.st = 'IDLE';
      }
    });
  }

  private fullReset() {
    this.score = 0;
    this.combo = 0;
    this.loadLvl(0);
  }

  /* ---- DRAWING ---- */

  private drawTraj(vx: number, vy: number) {
    this.aimGfx.clear();
    const g = this.lvl.gravity;
    const w = this.lvl.windForce ? this.lvl.windForce * 10 : 0;
    for (let i = 1; i <= 40; i++) {
      const t = i * 0.03;
      const x = this.ball.x + vx * t + 0.5 * w * t * t;
      const y = this.ball.y + vy * t + 0.5 * g * t * t;
      if (y > this.H || x > this.W || x < 0) break;
      this.aimGfx.fillStyle(0xffffff, (1 - i / 40) * 0.5);
      this.aimGfx.fillCircle(x, y, 2.5);
    }
  }

  private drawPwr(p: number) {
    this.pwrGfx.clear();
    const x = this.ball.x - 35, y = this.ball.y - 30, w = 8, h = 60;
    this.pwrGfx.fillStyle(0x333333, 0.7);
    this.pwrGfx.fillRoundedRect(x, y, w, h, 3);
    const fh = h * p;
    const c = p < 0.4 ? 0x4caf50 : p < 0.75 ? 0xffd600 : 0xf44336;
    this.pwrGfx.fillStyle(c, 0.9);
    this.pwrGfx.fillRoundedRect(x, y + h - fh, w, fh, 3);
  }

  private drawHoop() {
    this.hoopGfx.clear();
    const lx = this.rimL.x, rx = this.rimR.x, y = this.rimL.y;

    // Support pole
    this.hoopGfx.fillStyle(0x888888, 0.5);
    this.hoopGfx.fillRect(rx + 12, y + 32, 3, this.H - y - 82);

    // Backboard
    this.hoopGfx.fillStyle(0xeeeeee, 0.9);
    this.hoopGfx.fillRect(rx + 10, y - 32, 6, 64);
    this.hoopGfx.lineStyle(1.5, 0xcc0000, 0.7);
    this.hoopGfx.strokeRect(rx + 10, y - 14, 6, 28);

    // Rim
    this.hoopGfx.lineStyle(3.5, 0xff5722);
    this.hoopGfx.lineBetween(lx, y, rx, y);
    this.hoopGfx.fillStyle(0xff5722);
    this.hoopGfx.fillCircle(lx, y, 4);
    this.hoopGfx.fillCircle(rx, y, 4);

    // Net
    const nd = 30, sg = 6;
    this.hoopGfx.lineStyle(1, 0xffffff, 0.45);
    for (let i = 0; i <= sg; i++) {
      const topX = lx + (rx - lx) * (i / sg);
      const s = 5;
      const botX = lx + s + (rx - lx - 2 * s) * (i / sg);
      this.hoopGfx.lineBetween(topX, y + 2, botX, y + nd);
    }
    for (let j = 1; j <= 3; j++) {
      const t = j / 4, ny = y + nd * t, s = t * 5;
      this.hoopGfx.lineStyle(1, 0xffffff, 0.25);
      this.hoopGfx.lineBetween(lx + s, ny, rx - s, ny);
    }
  }

  private showMsg(text: string, color: string, dur = 1500) {
    this.msgTxt.setText(text).setColor(color).setAlpha(1).setScale(0.5);
    this.tweens.killTweensOf(this.msgTxt);
    this.tweens.add({
      targets: this.msgTxt, scaleX: 1, scaleY: 1, duration: 200, ease: 'Back.easeOut'
    });
    this.time.delayedCall(dur, () => {
      this.tweens.add({ targets: this.msgTxt, alpha: 0, duration: 300 });
    });
  }

  /* ---- UPDATE ---- */

  update(_t: number, d: number) {
    // Moving hoop
    if (this.lvl && this.lvl.hoopSpeed > 0) {
      this.hOff += this.hDir * this.lvl.hoopSpeed * d / 1000;
      if (Math.abs(this.hOff) > 70) this.hDir *= -1;

      const gap = this.RG * this.lvl.rimSize;
      const cx = this.lvl.hoopX + this.hOff;
      this.rimL.setPosition(cx - gap / 2, this.lvl.hoopY);
      this.rimR.setPosition(cx + gap / 2, this.lvl.hoopY);
      this.bb.setPosition(cx + gap / 2 + 15, this.lvl.hoopY);
      this.drawHoop();
    }

    if (this.st !== 'FLYING') return;

    const rimY = this.rimL.y;
    const ilx = this.rimL.x + 6, irx = this.rimR.x - 6;

    // Score: ball crosses rim line from above, between inner rim edges
    if (this.prevY <= rimY && this.ball.y >= rimY) {
      if (this.ball.x > ilx && this.ball.x < irx) {
        this.handleScore();
        return;
      }
    }
    this.prevY = this.ball.y;

    // Out of bounds
    if (this.ball.y > this.H + 60 || this.ball.x > this.W + 60 || this.ball.x < -60) {
      this.handleMiss();
      return;
    }

    // Stuck detection
    const v = this.ball.body!.velocity;
    if (Math.abs(v.x) < 8 && Math.abs(v.y) < 8) {
      this.stuckT += d;
      if (this.stuckT > 2000) { this.handleMiss(); return; }
    } else {
      this.stuckT = 0;
    }

    // Ball rotation
    this.ball.setAngle(this.ball.angle + v.x * d * 0.003);
  }
}
