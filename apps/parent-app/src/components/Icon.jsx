import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// Stroked line-icons (fill:none, stroke:currentColor) ported 1:1 from parent.html SVGs.
// `color` maps to the SVG stroke; pass size + strokeWidth to match source.

export default function Icon({ name, size = 24, color = '#000', strokeWidth = 2, fill = 'none' }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (name) {
    case 'chevronDown':
      return (
        <Svg {...common}>
          <Path d="M6 9l6 6 6-6" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...common}>
          <Path d="M20 6 9 17l-5-5" />
        </Svg>
      );
    case 'calendar':
      return (
        <Svg {...common}>
          <Rect x="3" y="4" width="18" height="16" rx="2" />
        </Svg>
      );
    case 'file':
      return (
        <Svg {...common}>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        </Svg>
      );
    case 'fileCheck':
      return (
        <Svg {...common}>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <Path d="M9 15l2 2 4-4" />
        </Svg>
      );
    case 'fileText':
      return (
        <Svg {...common}>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <Path d="M14 2v6h6" />
        </Svg>
      );
    case 'pencil':
      return (
        <Svg {...common}>
          <Path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </Svg>
      );
    case 'message':
      return (
        <Svg {...common}>
          <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </Svg>
      );
    case 'home':
      return (
        <Svg {...common}>
          <Path d="M3 11l9-8 9 8" />
          <Path d="M5 10v10h14V10" />
        </Svg>
      );
    case 'user':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="8" r="4" />
          <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </Svg>
      );
    case 'gear':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M12 5v2M12 17v2M5 12h2M17 12h2" />
        </Svg>
      );
    case 'shield':
      return (
        <Svg {...common}>
          <Path d="M12 3l8 3v6c0 4-3 7-8 9-5-2-8-5-8-9V6z" />
        </Svg>
      );
    case 'shieldCheck':
      return (
        <Svg {...common}>
          <Path d="M12 3l8 3v6c0 4-3 7-8 9-5-2-8-5-8-9V6z" />
          <Path d="M9 12l2 2 4-4" />
        </Svg>
      );
    case 'sun':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="4" />
          <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </Svg>
      );
    case 'chevronRight':
      return (
        <Svg {...common}>
          <Path d="M9 6l6 6-6 6" />
        </Svg>
      );
    case 'arrowLeft':
      return (
        <Svg {...common}>
          <Path d="M19 12H5M12 19l-7-7 7-7" />
        </Svg>
      );
    case 'trophy':
      return (
        <Svg {...common}>
          <Path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
        </Svg>
      );
    case 'trending':
      return (
        <Svg {...common}>
          <Path d="M3 17l6-6 4 4 8-8" />
        </Svg>
      );
    case 'house2':
      return (
        <Svg {...common}>
          <Path d="M4 20V10l8-6 8 6v10" />
        </Svg>
      );
    case 'play':
      // filled play triangle (fill supplied by caller)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
          <Path d="M8 5v14l11-7z" />
        </Svg>
      );
    default:
      return null;
  }
}
