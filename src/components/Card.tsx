import React from 'react';
import {colors} from '../config';

/** Landingdagi to'q jigarrang karta */
export const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({
  style,
  children,
}) => (
  <div
    style={{
      background: colors.card,
      borderRadius: 32,
      border: `2px solid ${colors.cardBorder}`,
      boxShadow: '0 24px 60px rgba(60, 16, 0, 0.45)',
      ...style,
    }}
  >
    {children}
  </div>
);
