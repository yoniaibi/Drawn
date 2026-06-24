import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, ClipPath, Rect, G, Circle, Line, Text as SvgText } from 'react-native-svg';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 120,
  md: 180,
  lg: 240,
};

export default function TicketLogo({ size = 'md' }: Props) {
  const width = sizes[size];
  const height = width * (140 / 400);

  return (
    <View style={{ width, height }}>
      <Svg viewBox="0 0 400 140" width={width} height={height}>
        <Defs>
          <ClipPath id="ticket">
            <Rect x="20" y="10" width="360" height="120" rx="14" />
          </ClipPath>
        </Defs>

        <Rect width="400" height="140" fill="#1A1040" />

        <G clipPath="url(#ticket)">
          {/* Pink body */}
          <Rect x="20" y="10" width="360" height="120" fill="#F472B6" />
          {/* Deep rose stub */}
          <Rect x="302" y="10" width="78" height="120" fill="#C43070" />

          {/* Notch circles — top */}
          {[56, 97, 138, 179, 220, 271, 312, 353].map(cx => (
            <Circle key={`t${cx}`} cx={cx} cy="10" r="11" fill="#1A1040" />
          ))}
          {/* Notch circles — bottom */}
          {[56, 97, 138, 179, 220, 271, 312, 353].map(cx => (
            <Circle key={`b${cx}`} cx={cx} cy="130" r="11" fill="#1A1040" />
          ))}

          {/* Dashed tear line */}
          <Line
            x1="302" y1="10" x2="302" y2="130"
            stroke="#1A1040" strokeWidth="2.5"
            strokeDasharray="6 5" strokeLinecap="round"
          />

          {/* Wordmark */}
          <SvgText
            x="161" y="83"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="52"
            fontWeight="bold"
            fontStyle="italic"
            letterSpacing="-2"
            fill="#1A1040"
            textAnchor="middle"
          >
            drawn
          </SvgText>

          {/* Winner dot */}
          <Circle cx="341" cy="70" r="17" fill="#FAF9FE" />
        </G>
      </Svg>
    </View>
  );
}
