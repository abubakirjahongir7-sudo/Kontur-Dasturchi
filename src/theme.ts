import {loadFont} from '@remotion/fonts';
// Shrift npm paketidan olinadi — render paytida internet kerak emas
import latin from '@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2';
import latinExt from '@fontsource-variable/montserrat/files/montserrat-latin-ext-wght-normal.woff2';
import cyrillic from '@fontsource-variable/montserrat/files/montserrat-cyrillic-wght-normal.woff2';

// Lotin (o‘, g‘, ʻ belgilari bilan), kengaytirilgan lotin va kirill
const files: [string, string][] = [
  [
    latin,
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  ],
  [
    latinExt,
    'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
  ],
  [cyrillic, 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'],
];

for (const [url, unicodeRange] of files) {
  loadFont({family: 'Montserrat', url, weight: '100 900', unicodeRange, format: 'woff2'});
}

export const font = 'Montserrat, sans-serif';
