import { AudioSpeed, PreferredPronunciation } from '../models/user';

export type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'unavailable';

export interface PlayAudioParams {
  word: string;
  variant: PreferredPronunciation;
  audioUrl?: string;
  speed?: AudioSpeed;
  onStateChange?: (state: AudioState, errorMessage?: string) => void;
}

class AudioService {
  private currentAudio: HTMLAudioElement | null = null;

  public playPronunciation({
    word,
    variant,
    audioUrl,
    speed = 1,
    onStateChange
  }: PlayAudioParams): () => void {
    // Cancel any ongoing speech or audio
    this.stopAll();

    onStateChange?.('loading');

    // If an explicit audio file URL is provided and non-empty
    if (audioUrl && audioUrl.trim().length > 0) {
      try {
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        audio.playbackRate = speed;

        audio.onplay = () => onStateChange?.('playing');
        audio.onpause = () => onStateChange?.('paused');
        audio.onended = () => onStateChange?.('idle');
        audio.onerror = () => onStateChange?.('error', 'Audio playback failed');

        audio.play().catch(() => {
          onStateChange?.('error', 'Audio play request denied');
        });

        return () => {
          audio.pause();
          this.currentAudio = null;
          onStateChange?.('idle');
        };
      } catch (e) {
        console.warn('Audio URL playback error, falling back to Web Speech API', e);
      }
    }

    // Web Speech API Synthesis Fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = speed;
      utterance.lang = variant === 'british' ? 'en-GB' : 'en-US';

      // Pick exact matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const targetLang = variant === 'british' ? 'en-GB' : 'en-US';
      const matchedVoice = voices.find(v => v.lang.includes(targetLang) || v.lang.includes(variant));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => onStateChange?.('playing');
      utterance.onend = () => onStateChange?.('idle');
      utterance.onerror = () => onStateChange?.('error', 'Speech synthesis unavailable');

      try {
        window.speechSynthesis.speak(utterance);
        return () => {
          window.speechSynthesis.cancel();
          onStateChange?.('idle');
        };
      } catch (e) {
        onStateChange?.('unavailable', 'Audio unavailable');
        return () => {};
      }
    } else {
      onStateChange?.('unavailable', 'Audio unavailable');
      return () => {};
    }
  }

  public stopAll(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioService = new AudioService();
