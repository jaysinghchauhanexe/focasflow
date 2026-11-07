import React from 'react';

export interface FaceProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  isActive?: boolean;
}

/**
 * Kawaii Mood Face Designs inspired by expressive chibi illustration style:
 * Clean, minimalist monochrome facial expressions with expressive eyes,
 * specular cutout highlights, and emotive brows/mouths.
 */

/* 1. Stressed: Spiral swirl eyes with flat tense mouth */
export const StressedFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.1, isActive = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} ${isActive ? 'animate-face-stressed' : 'group-hover:animate-face-stressed'}`}
  >
    {/* Spiral swirl eyes (Row 2, Col 3 in kawaii reference) */}
    {/* Left spiral eye */}
    <path
      d="M 7.3 9.7 C 7.3 9 7.9 9 7.9 9.7 C 7.9 10.7 6.1 10.7 6.1 9.7 C 6.1 7.9 9 7.9 9 9.7 C 9 11.9 4.9 11.9 4.9 9.7"
      className={isActive ? 'animate-pulse' : ''}
    />
    {/* Right spiral eye */}
    <path
      d="M 16.7 9.7 C 16.7 9 17.3 9 17.3 9.7 C 17.3 10.7 15.5 10.7 15.5 9.7 C 15.5 7.9 18.4 7.9 18.4 9.7 C 18.4 11.9 14.3 11.9 14.3 9.7"
      className={isActive ? 'animate-pulse' : ''}
    />

    {/* Flat tense mouth */}
    <path d="M 9.5 15.5 H 14.5" />
  </svg>
);

/* 2. Anxious: Worried slanted brows, glistening puppy eyes with reflections, nervous wavy mouth, sweat drop */
export const AnxiousFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.1, isActive = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} ${isActive ? 'animate-face-anxious' : 'group-hover:animate-face-anxious'}`}
  >
    {/* Worried drooping slanted eyebrows */}
    <path d="M 5.8 6.5 L 9.2 7.8" />
    <path d="M 18.2 6.5 L 14.8 7.8" />

    {/* Glistening puppy eyes with specular cutout glints */}
    {/* Left eye at (7.5, 10.5) */}
    <path
      d="M 7.5 8 a 2.5 2.5 0 1 0 0.001 0 M 8.3 8.9 a 0.85 0.85 0 1 1 -0.001 0 M 6.7 11.4 a 0.5 0.5 0 1 1 -0.001 0"
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
    />
    {/* Right eye at (16.5, 10.5) */}
    <path
      d="M 16.5 8 a 2.5 2.5 0 1 0 0.001 0 M 17.3 8.9 a 0.85 0.85 0 1 1 -0.001 0 M 15.7 11.4 a 0.5 0.5 0 1 1 -0.001 0"
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
    />

    {/* Anxious trembling mouth */}
    <path d="M 9.5 15.8 Q 10.75 14.6 12 15.8 Q 13.25 17 14.5 15.8" />

    {/* Animated nervous sweat drop */}
    <g className={isActive ? 'animate-sweat-drip' : 'group-hover:animate-sweat-drip'}>
      <path
        d="M 20.2 4.2 C 20.2 4.2 19.1 5.3 19.1 6.2 C 19.1 6.8 19.5 7.2 20.2 7.2 C 20.9 7.2 21.3 6.8 21.3 6.2 C 21.3 5.3 20.2 4.2 20.2 4.2 Z"
        fill="currentColor"
        stroke="none"
      />
    </g>
  </svg>
);

/* 3. Okay: Chill flat eyebrows, glossy forward-looking eyes with blink animation, straight mouth */
export const OkayFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.1, isActive = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Relaxed flat eyebrows */}
    <path d="M 6 6.8 H 9" />
    <path d="M 15 6.8 H 18" />

    {/* Chill eyes with shine highlights, with smooth blink animation */}
    <g className={isActive ? 'animate-face-okay' : 'group-hover:animate-face-okay'}>
      <path
        d="M 7.5 8.1 a 2.3 2.3 0 1 0 0.001 0 M 8.2 9 a 0.8 0.8 0 1 1 -0.001 0"
        fill="currentColor"
        stroke="none"
        fillRule="evenodd"
      />
      <path
        d="M 16.5 8.1 a 2.3 2.3 0 1 0 0.001 0 M 17.2 9 a 0.8 0.8 0 1 1 -0.001 0"
        fill="currentColor"
        stroke="none"
        fillRule="evenodd"
      />
    </g>

    {/* Calm horizontal straight mouth */}
    <path d="M 9.5 15.5 H 14.5" />
  </svg>
);

/* 4. Calm: Peaceful curved resting eyes, gentle serene smile */
export const CalmFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.1, isActive = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} ${isActive ? 'animate-face-calm' : 'group-hover:animate-face-calm'}`}
  >
    {/* Peaceful curved resting eyes ⌒ ⌒ */}
    <path d="M 5.8 10.2 C 6.2 8 8.8 8 9.2 10.2" />
    <path d="M 14.8 10.2 C 15.2 8 17.8 8 18.2 10.2" />

    {/* Gentle serene curved smile */}
    <path d="M 9.5 14.8 Q 12 17.2 14.5 14.8" />
  </svg>
);

/* 5. Great: Joyful happy eyebrows, sparkling round eyes with dual glints, open happy smile */
export const GreatFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.1, isActive = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} ${isActive ? 'animate-face-great' : 'group-hover:animate-face-great'}`}
  >
    {/* Cheerful happy eyebrows */}
    <path d="M 6.2 6.5 Q 7.7 5.2 9.2 6.6" />
    <path d="M 17.8 6.5 Q 16.3 5.2 14.8 6.6" />

    {/* Big sparkling eyes with dual shine highlights */}
    {/* Left eye at (7.5, 10.2) */}
    <path
      d="M 7.5 7.6 a 2.6 2.6 0 1 0 0.001 0 M 8.3 8.6 a 0.95 0.95 0 1 1 -0.001 0 M 6.7 11.2 a 0.5 0.5 0 1 1 -0.001 0"
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
    />
    {/* Right eye at (16.5, 10.2) */}
    <path
      d="M 16.5 7.6 a 2.6 2.6 0 1 0 0.001 0 M 17.3 8.6 a 0.95 0.95 0 1 1 -0.001 0 M 15.7 11.2 a 0.5 0.5 0 1 1 -0.001 0"
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
    />

    {/* Joyful open happy smile (Row 2, Col 2 in kawaii reference) */}
    <path
      d="M 9.5 14.2 H 14.5 C 14.5 17.8 9.5 17.8 9.5 14.2 Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);
