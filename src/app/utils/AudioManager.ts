/**
 * AudioManager is a utility class for managing audio playback in a web application.
 * It provides methods to load, play, pause, and control audio elements with easy-to-use key-based access.
 * The class supports features like looping, volume control, and error handling for sound management.
 */

class AudioManager {
  private sounds: Record<string, HTMLAudioElement> = {};

  /**
   * Loads audio files into the manager using a dictionary of sound keys and their corresponding file paths.
   */ 
  loadSounds(sounds: Record<string, string>) {
    if (typeof window === 'undefined') return;
    Object.keys(sounds).forEach((key) => {
        const audio = new Audio(sounds[key]);
        this.sounds[key] = audio;
    });
  }

  /**
   * Plays a sound by its key, with optional looping configuration.
   * Handles potential playback errors and provides console error logging.
   */ 

  playSound(key: string, options: { loop?: boolean} = {}) {
    const audio = this.sounds[key];
    if (audio) {
        audio.loop = options.loop || false;
        audio.play().catch((error) => {
          console.error(`Error playing sound with key "${key}":`, error);
      });
    } else {
        console.error(`Sound with key "${key}" not found.`);
    }
  }

  /**
   * Pauses a specific sound and resets its playback to the beginning.
   */ 
  pauseSound(soundName: string): void {
      const audio = this.sounds[soundName];
      if (audio) {
          audio.pause();
          audio.currentTime = 0;
      } else {
          console.error(`Sound with key "${soundName}" not found for pausing`);
      }
  }

  /**
   * Sets the volume for a specific sound, ensuring it stays within the 0-1 range.
   */ 
  setVolume(soundName: string, volume: number): void {
      const audio = this.sounds[soundName];
      if (audio) {
          audio.volume = Math.max(0, Math.min(1, volume));
      }
  }

  
  /**
   * Sets the current playback time for a specific sound.
   */ 
  setCurrentTime(soundName: string, timestamp: number): void {
    const audio = this.sounds[soundName];
    if (audio && timestamp >= 0) {
        audio.currentTime = timestamp;
    } else {
        console.error(`Invalid timestamp`);
    }
  }
}

export default AudioManager;
