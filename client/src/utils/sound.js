class AviatorSound {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.engineOscillator = null;
    this.engineGain = null;
    this.crashBuffer = null;
  }

  init() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.generateCrashBuffer();
  }

  generateCrashBuffer() {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.8;
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 8);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.8;
        if (t < 0.05) {
          data[i] += Math.sin(2 * Math.PI * 150 * t) * (1 - t / 0.05) * 0.5;
        }
      }
    }
    this.crashBuffer = buffer;
  }

  startEngine() {
    if (!this.enabled || !this.audioContext) return;
    this.stopEngine();
    
    this.engineOscillator = this.audioContext.createOscillator();
    this.engineGain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    this.engineOscillator.type = 'sawtooth';
    this.engineOscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
    filter.Q.setValueAtTime(2, this.audioContext.currentTime);
    
    this.engineGain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    
    this.engineOscillator.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.audioContext.destination);
    this.engineOscillator.start();
  }

  updateEngine(multiplier) {
    if (!this.engineOscillator || !this.enabled) return;
    const freq = 80 + (multiplier - 1) * 40;
    const gain = Math.min(0.15, 0.08 + (multiplier - 1) * 0.01);
    this.engineOscillator.frequency.setTargetAtTime(Math.min(freq, 800), this.audioContext.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(gain, this.audioContext.currentTime, 0.1);
  }

  stopEngine() {
    if (this.engineOscillator) {
      try {
        this.engineOscillator.stop();
      } catch (e) {}
      this.engineOscillator = null;
    }
  }

  playCrash() {
    if (!this.enabled || !this.audioContext || !this.crashBuffer) return;
    
    this.stopEngine();
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.crashBuffer;
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.6, this.audioContext.currentTime);
    
    source.connect(gain);
    gain.connect(this.audioContext.destination);
    source.start();
  }

  playCashout() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99];
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }

  playCountdown() {
    if (!this.enabled || !this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  playBetPlaced() {
    if (!this.enabled || !this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopEngine();
    }
    return this.enabled;
  }
}

export const aviatorSound = new AviatorSound();
