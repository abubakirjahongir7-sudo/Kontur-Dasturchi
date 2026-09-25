import {loadFont} from '@remotion/fonts';
// Shriftlar npm paketidan olinadi — render paytida internet kerak emas
import unboundedLatin from '@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2';
import unboundedLatinExt from '@fontsource-variable/unbounded/files/unbounded-latin-ext-wght-normal.woff2';
import unboundedCyrillic from '@fontsource-variable/unbounded/files/unbounded-cyrillic-wght-normal.woff2';
import manropeLatin from '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2';
import manropeLatinExt from '@fontsource-variable/manrope/files/manrope-latin-ext-wght-normal.woff2';
import manropeCyrillic from '@fontsource-variable/manrope/files/manrope-cyrillic-wght-normal.woff2';

// Lotin (o‘, g‘, ʻ belgilari bilan), kengaytirilgan lotin va kirill
const ranges = {
  latin:
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  latinExt:
    'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
  cyrillic: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
};

const load = (family: string, files: [string, string, string]) => {
  const [latin, latinExt, cyrillic] = files;
  for (const [url, unicodeRange] of [
    [latin, ranges.latin],
    [latinExt, ranges.latinExt],
    [cyrillic, ranges.cyrillic],
  ] as const) {
    loadFont({family, url, weight: '100 900', unicodeRange, format: 'woff2'});
  }
};

load('Unbounded', [unboundedLatin, unboundedLatinExt, unboundedCyrillic]);
load('Manrope', [manropeLatin, manropeLatinExt, manropeCyrillic]);

export const fonts = {
  display: 'Unbounded, sans-serif',
  body: 'Manrope, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

export const colors = {
  bg: '#07080C',
  surface: '#11131A',
  border: 'rgba(255,255,255,0.10)',
  text: '#F4F5F7',
  muted: '#9AA3B2',
  violet: '#7C5CFF',
  cyan: '#22D3EE',
};

export const gradient = (a: string, b: string, angle = 90) =>
  `linear-gradient(${angle}deg, ${a}, ${b})`;
