export enum Language {
  ENGLISH = 'English',
  HAUSA = 'Hausa',
  IGBO = 'Igbo',
  YORUBA = 'Yoruba',
  PIDGIN = 'Nigerian Pidgin'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isAudio?: boolean;
}

export enum AppMode {
  TEXT = 'text',
  LIVE = 'live'
}