import {loadFont} from '@remotion/fonts';
// Shriftlar npm paketlaridan olinadi — render paytida internet kerak emas
import interLatin from '@fontsource-variable/inter/files/inter-latin-standard-normal.woff2';
import interLatinExt from '@fontsource-variable/inter/files/inter-latin-ext-standard-normal.woff2';
import scriptLatin from '@fontsource/grand-hotel/files/grand-hotel-latin-400-normal.woff2';

const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

// Inter: og'irlik (100–900) va optik o'lcham o'qlari bilan — katta yozuvlarda zichroq ko'rinadi
loadFont({family: 'Inter', url: interLatin, weight: '100 900', unicodeRange: LATIN, format: 'woff2'});
loadFont({family: 'Inter', url: interLatinExt, weight: '100 900', unicodeRange: LATIN_EXT, format: 'woff2'});
// Instagram logotipiga o'xshash qo'lyozma shrift
loadFont({family: 'Grand Hotel', url: scriptLatin, weight: '400', format: 'woff2'});

export const sans = 'Inter, sans-serif';
export const script = '"Grand Hotel", cursive';
