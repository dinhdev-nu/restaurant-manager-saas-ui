// Sound utility for POS system
// Uses Web Audio API for better performance

class SoundManager {
  constructor() {
    this.sounds = {
      addToCart: { frequency: 800, duration: 100, type: 'sine' },
      removeItem: { frequency: 400, duration: 150, type: 'sine' },
      success: { frequency: 1000, duration: 200, type: 'sine' },
      error: { frequency: 300, duration: 300, type: 'square' },
      notification: { frequency: 600, duration: 150, type: 'sine' }
    };
    
    this.enabled = true;
    this.volume = 0.3;
    
    // Initialize AudioContext
    this.audioContext = null;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      // Create AudioContext on user interaction (required by browsers)
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  playSound(soundName) {
    if (!this.enabled || !this.audioContext || !this.sounds[soundName]) {
      return;
    }

    try {
      const sound = this.sounds[soundName];
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = sound.frequency;
      oscillator.type = sound.type;

      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + sound.duration / 1000
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + sound.duration / 1000);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  playAddToCart() {
    this.playSound('addToCart');
  }

  playRemoveItem() {
    this.playSound('removeItem');
  }

  playSuccess() {
    // Play a pleasant success chord
    this.playChord([1000, 1200, 1500], 300);
  }

  playError() {
    this.playSound('error');
  }

  playNotification() {
    this.playSound('notification');
  }

  playChord(frequencies, duration) {
    if (!this.enabled || !this.audioContext) {
      return;
    }

    try {
      frequencies.forEach((frequency, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + duration / 1000
          );

          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + duration / 1000);
        }, index * 50);
      });
    } catch (error) {
      console.warn('Error playing chord:', error);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled && !this.audioContext) {
      this.initAudioContext();
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// Export singleton instance
const soundManager = new SoundManager();
export default soundManager;
