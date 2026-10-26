export interface FontDef {
  family: string;
  category: string;
  variants?: string[];
  tags?: string[];
  provider?: 'fontsource' | 'google';
  id?: string;
  subset?: string;
}
