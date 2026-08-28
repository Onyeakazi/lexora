import { PreferredPronunciation } from '../models/user';

export type SpeechState = 'idle' | 'listening' | 'processing' | 'success' | 'retry' | 'unsupported';

export interface SpeechFeedback {
  state: SpeechState;
  transcript?: string;
  isMatch?: boolean;
  message?: string;
}

class SpeechRecognitionService {
  private recognition: any = null;

  public isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  public startListening({
    targetWord,
    variant = 'british',
    onFeedback
  }: {
    targetWord: string;
    variant?: PreferredPronunciation;
    onFeedback: (feedback: SpeechFeedback) => void;
  }): () => void {
    if (!this.isSupported()) {
      onFeedback({
        state: 'unsupported',
        message: 'Speech recognition is not supported in this browser.'
      });
      return () => {};
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = variant === 'british' ? 'en-GB' : 'en-US';

      onFeedback({ state: 'listening', message: 'Listening... Speak now!' });

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        const target = targetWord.trim().toLowerCase();

        const isExact = transcript === target || transcript.includes(target) || target.includes(transcript);

        if (isExact) {
          onFeedback({
            state: 'success',
            transcript,
            isMatch: true,
            message: `Excellent! You pronounced "${transcript}" clearly.`
          });
        } else {
          onFeedback({
            state: 'retry',
            transcript,
            isMatch: false,
            message: `You said "${transcript}". Try emphasizing the syllables!`
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          onFeedback({
            state: 'retry',
            message: 'No speech detected. Please tap the mic and try speaking again.'
          });
        } else if (event.error === 'not-allowed') {
          onFeedback({
            state: 'unsupported',
            message: 'Microphone permission denied. Please allow microphone access to practice.'
          });
        } else {
          onFeedback({
            state: 'retry',
            message: `Speech recognition error: ${event.error}`
          });
        }
      };

      this.recognition.onend = () => {
        // Recognition completed
      };

      this.recognition.start();

      return () => {
        if (this.recognition) {
          try {
            this.recognition.stop();
          } catch (e) {}
        }
      };
    } catch (err) {
      console.warn('Speech recognition start failed', err);
      onFeedback({
        state: 'unsupported',
        message: 'Failed to start speech recognition.'
      });
      return () => {};
    }
  }

  public startVoiceSearch({
    onResult,
    onError,
    onStateChange
  }: {
    onResult: (spokenWord: string) => void;
    onError?: (err: string) => void;
    onStateChange?: (isListening: boolean) => void;
  }): () => void {
    if (!this.isSupported()) {
      onError?.('Voice search is not supported in this browser.');
      return () => {};
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      onStateChange?.(true);

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim().replace(/[\.\?]$/, '');
        onStateChange?.(false);
        if (transcript) {
          onResult(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        onStateChange?.(false);
        if (event.error === 'not-allowed') {
          onError?.('Microphone access denied. Please allow microphone access to search by voice.');
        } else if (event.error !== 'no-speech') {
          onError?.(`Voice search error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        onStateChange?.(false);
      };

      this.recognition.start();

      return () => {
        if (this.recognition) {
          try {
            this.recognition.stop();
          } catch (e) {}
        }
      };
    } catch (e) {
      onStateChange?.(false);
      onError?.('Failed to start voice search.');
      return () => {};
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
