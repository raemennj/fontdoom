export interface FontDef {
  family: string;
  category: string;
  variants?: string[];
  tags?: string[]; // Added tags for fun categorization
}

export interface FontCardProps {
  font: FontDef;
  sampleText: string;
  fontSize: number;
  isDark: boolean;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AIFontResponse {
  fonts: string[];
  reasoning: string;
}