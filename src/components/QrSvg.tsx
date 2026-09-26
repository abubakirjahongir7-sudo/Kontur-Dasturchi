import React, {useId, useMemo} from 'react';
import QRCode from 'qrcode';
import {font} from '../theme';

const QUIET = 4; // QR atrofidagi majburiy bo'sh joy (modullarda)

type Props = {
  text: string;
  size: number;
  logoLetter?: string;
  background?: string;
};

/**
 * Brend uslubidagi QR kod: yumaloqlangan modullar, jigarrang gradient, yumaloq "ko'zlar"
 * va markazda sariq logo. Xatoni tuzatish darajasi H (30%) — logo skanerga xalal bermaydi.
 */
export const QrSvg: React.FC<Props> = ({text, size, logoLetter, background = '#FFF8EE'}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const qr = useMemo(() => QRCode.create(text, {errorCorrectionLevel: 'H'}), [text]);
  const n = qr.modules.size;
  const total = n + QUIET * 2;

  // Markazdagi logo uchun bo'shatiladigan kvadrat (toq son, ~22% eni)
  const logoSize = logoLetter ? Math.round(n * 0.22) | 1 : 0;
  const logoStart = (n - logoSize) / 2;

  const eyes = [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ];
  const inEye = (r: number, c: number) => eyes.some(([er, ec]) => r >= er && r < er + 7 && c >= ec && c < ec + 7);
  const inLogo = (r: number, c: number) =>
    logoSize > 0 && r >= logoStart && r < logoStart + logoSize && c >= logoStart && c < logoStart + logoSize;

  const modules: React.ReactNode[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.modules.get(r, c) || inEye(r, c) || inLogo(r, c)) continue;
      modules.push(
        <rect
          key={`${r}-${c}`}
          x={c + QUIET + 0.04}
          y={r + QUIET + 0.04}
          width={0.92}
          height={0.92}
          rx={0.25}
        />,
      );
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${total} ${total}`} shapeRendering="geometricPrecision">
      <defs>
        <linearGradient id={`${id}-dark`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2A1206" />
          <stop offset="100%" stopColor="#7A2A06" />
        </linearGradient>
        <linearGradient id={`${id}-logo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="55%" stopColor="#F5B82E" />
          <stop offset="100%" stopColor="#E09A10" />
        </linearGradient>
      </defs>

      {background !== 'transparent' ? <rect width={total} height={total} fill={background} rx={2.2} /> : null}

      <g fill={`url(#${id}-dark)`}>{modules}</g>

      {/* Burchakdagi "ko'zlar". Yumaloqlik ataylab o'rtacha: juda yumaloq ko'zlarni
          ba'zi skanerlar (masalan, OpenCV) o'qiy olmaydi */}
      {eyes.map(([er, ec]) => (
        <g key={`${er}-${ec}`}>
          <rect
            x={ec + QUIET + 0.5}
            y={er + QUIET + 0.5}
            width={6}
            height={6}
            rx={0.3}
            fill="none"
            stroke={`url(#${id}-dark)`}
            strokeWidth={1}
          />
          <rect x={ec + QUIET + 2} y={er + QUIET + 2} width={3} height={3} rx={0.48} fill="#7A2A06" />
        </g>
      ))}

      {/* Markazdagi logo */}
      {logoLetter ? (
        <g>
          <rect
            x={logoStart + QUIET + 0.4}
            y={logoStart + QUIET + 0.4}
            width={logoSize - 0.8}
            height={logoSize - 0.8}
            rx={2}
            fill={`url(#${id}-logo)`}
            stroke="#2A1206"
            strokeWidth={0.35}
          />
          <text
            x={QUIET + n / 2}
            y={QUIET + n / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={font}
            fontWeight={900}
            fontSize={(logoSize - 0.8) * 0.7}
            fill="#2A1206"
          >
            {logoLetter}
          </text>
        </g>
      ) : null}
    </svg>
  );
};
