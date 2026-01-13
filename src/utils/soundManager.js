// Sound effects manager for the game

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;

    // Load sound enabled state from localStorage
    const savedEnabled = localStorage.getItem('sound_enabled');
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
    }

    // Create audio context for generated sounds
    this.audioContext = null;
  }

  // Initialize audio context (must be done after user interaction)
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Play a beep sound with specified frequency
  playBeep(frequency, duration, type = 'sine') {
    if (!this.enabled) return;

    this.init();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Sound effects for different actions
  playMove() {
    this.playBeep(400, 0.1, 'sine');
  }

  playWin() {
    if (!this.enabled) return;
    this.init();

    // Victory fanfare
    setTimeout(() => this.playBeep(523, 0.15, 'square'), 0);
    setTimeout(() => this.playBeep(659, 0.15, 'square'), 150);
    setTimeout(() => this.playBeep(784, 0.3, 'square'), 300);
  }

  playLoss() {
    if (!this.enabled) return;
    this.init();

    // Descending notes
    setTimeout(() => this.playBeep(400, 0.15, 'sine'), 0);
    setTimeout(() => this.playBeep(300, 0.15, 'sine'), 150);
    setTimeout(() => this.playBeep(200, 0.3, 'sine'), 300);
  }

  playDraw() {
    this.playBeep(350, 0.2, 'triangle');
  }

  playClick() {
    this.playBeep(600, 0.05, 'square');
  }

  playCoin() {
    if (!this.enabled) return;
    this.init();

    // Coin sound
    setTimeout(() => this.playBeep(800, 0.08, 'sine'), 0);
    setTimeout(() => this.playBeep(1000, 0.08, 'sine'), 80);
  }

  playError() {
    this.playBeep(200, 0.2, 'sawtooth');
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('sound_enabled', this.enabled.toString());
    return this.enabled;
  }

  // Set volume (0-1)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Check if sound is enabled
  isEnabled() {
    return this.enabled;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
