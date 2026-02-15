/**
 * Synthesized sound effects using Web Audio API.
 * No external audio files needed.
 */
export default class SoundManager {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  /** Short percussive bounce */
  bounce() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  }

  /** Swish / net sound — filtered noise burst */
  swish() {
    const ctx = this.getCtx();
    const dur = 0.25;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + dur);
    filter.Q.value = 1.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + dur);
  }

  /** Crowd cheer — layered noise + tonal burst */
  cheer() {
    const ctx = this.getCtx();
    const dur = 0.8;
    // Crowd noise
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 0.5;
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.2, ctx.currentTime);
    g1.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.15);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(bp).connect(g1).connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + dur);

    // Victory tone
    const osc = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523, ctx.currentTime);        // C5
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12); // E5
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24); // G5
    g2.gain.setValueAtTime(0.2, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(g2).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
  }

  /** Miss — descending tone */
  miss() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.4);
  }
}
