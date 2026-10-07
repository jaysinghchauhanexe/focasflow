import React from 'react';

interface DoodleProps {
  size?: number;
  className?: string;
}

/**
 * 1a. DoodleTasks — Hand-drawn checklist clipboard with pencil, sparkles & checkmarks in doodle style
 */
export const DoodleTasks: React.FC<DoodleProps> = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Twinkle Stars & Sparkles */}
    <path
      d="M16 22L18 25L21 26.5L18 28L16 31L14 28L11 26.5L14 25Z"
      fill="var(--tag-learning, #F59E0B)"
    />
    <path
      d="M82 18L83.5 21L86.5 22.5L83.5 24L82 27L80.5 24L77.5 22.5L80.5 21Z"
      fill="var(--tag-personal, #EC4899)"
    />

    {/* Left Yellow / Orange Squiggle Doodle */}
    <path
      d="M14 42C16 45 12 48 14 52C16 55 12 58 14 62"
      stroke="var(--tag-learning, #F59E0B)"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Back Clipboard Pad */}
    <rect
      x="22"
      y="20"
      width="54"
      height="66"
      rx="12"
      fill="var(--color-primary)"
      fillOpacity="0.85"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Top Metal Clip Clamp */}
    <rect
      x="36"
      y="16"
      width="26"
      height="10"
      rx="4"
      fill="#FFFFFF"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
    />
    {/* Clip Loop */}
    <path
      d="M44 16V12C44 9.5 54 9.5 54 12V16"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Main White Sheet */}
    <rect
      x="26"
      y="24"
      width="46"
      height="58"
      rx="8"
      fill="#FFFFFF"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
    />

    {/* Row 1: Green Checked Box */}
    <rect
      x="32"
      y="35"
      width="9"
      height="9"
      rx="3"
      fill="var(--tag-health, #10B981)"
      stroke="var(--color-text, #111827)"
      strokeWidth="2"
    />
    <path
      d="M34 39.5L36.5 42L40.5 37"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M46 39.5H64"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Row 2: In-Progress Box with Dot */}
    <rect
      x="32"
      y="49"
      width="9"
      height="9"
      rx="3"
      fill="var(--color-primary)"
      fillOpacity="0.25"
      stroke="var(--color-text, #111827)"
      strokeWidth="2"
    />
    <circle cx="36.5" cy="53.5" r="2.2" fill="var(--color-primary)" />
    <path
      d="M46 53.5H60"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Row 3: Empty Box */}
    <rect
      x="32"
      y="63"
      width="9"
      height="9"
      rx="3"
      fill="none"
      stroke="var(--color-text, #111827)"
      strokeWidth="2"
    />
    <path
      d="M46 67.5H55"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Tilted Doodle Pencil on Right */}
    <g transform="rotate(28 78 68)">
      {/* Pencil Body */}
      <rect
        x="72"
        y="50"
        width="7"
        height="22"
        rx="2"
        fill="var(--tag-learning, #F59E0B)"
        stroke="var(--color-text, #111827)"
        strokeWidth="2"
      />
      {/* Eraser Top */}
      <rect
        x="72"
        y="45"
        width="7"
        height="5"
        rx="1.5"
        fill="var(--tag-personal, #EC4899)"
        stroke="var(--color-text, #111827)"
        strokeWidth="2"
      />
      {/* Pencil Tip */}
      <polygon
        points="72,72 79,72 75.5,78"
        fill="#FFFFFF"
        stroke="var(--color-text, #111827)"
        strokeWidth="2"
      />
      <polygon
        points="74,75 77,75 75.5,78"
        fill="var(--color-text, #111827)"
      />
    </g>

    {/* Playful Dashed Curve Underneath */}
    <path
      d="M26 88C38 95 62 95 74 88"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="4 4"
    />
  </svg>
);

/**
 * 1. DoodleCalendar — Whimsical hand-drawn calendar matching the doodle illustration system
 */
export const DoodleCalendar: React.FC<DoodleProps> = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Left Orange Squiggle Doodle */}
    <path
      d="M15 30C17 33 13 36 15 40C17 43 13 46 15 50C17 53 14 55 16 58"
      stroke="var(--tag-learning, #F59E0B)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Top Right Pink/Purple Sparkle Burst */}
    <path
      d="M68 15L71 9"
      stroke="var(--tag-personal, #EC4899)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M74 20L81 17"
      stroke="var(--tag-personal, #EC4899)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M73 25L79 29"
      stroke="var(--tag-personal, #EC4899)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Top Binder Ear Left */}
    <path
      d="M34 32V23C34 20 38 18 41 21C44 24 43 29 43 32"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="#FFFFFF"
    />
    {/* Top Binder Ear Right */}
    <path
      d="M60 32V23C60 20 64 18 67 21C70 24 69 29 69 32"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="#FFFFFF"
    />

    {/* Main Calendar Body (Theme Primary Tint) */}
    <rect
      x="24"
      y="28"
      width="56"
      height="54"
      rx="16"
      fill="var(--color-primary)"
      fillOpacity="0.85"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Top Binder Slot Insets */}
    <rect x="35" y="23" width="6" height="8" rx="3" fill="#FFFFFF" stroke="var(--color-text, #111827)" strokeWidth="2" />
    <rect x="61" y="23" width="6" height="8" rx="3" fill="#FFFFFF" stroke="var(--color-text, #111827)" strokeWidth="2" />

    {/* Inner White Sheet */}
    <rect
      x="27"
      y="42"
      width="50"
      height="36"
      rx="9"
      fill="#FFFFFF"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
    />

    {/* Top Header Divider Line */}
    <path
      d="M27 45H77"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Row 1 Grid Boxes */}
    <rect x="32" y="49" width="8" height="8" rx="2" stroke="var(--color-text, #111827)" strokeWidth="1.8" fill="none" />
    <rect x="43" y="49" width="8" height="8" rx="2" stroke="var(--color-text, #111827)" strokeWidth="1.8" fill="none" />
    <rect x="54" y="49" width="8" height="8" rx="2" stroke="var(--color-text, #111827)" strokeWidth="1.8" fill="none" />
    <rect x="65" y="49" width="8" height="8" rx="2" stroke="var(--color-text, #111827)" strokeWidth="1.8" fill="none" />

    {/* Row 2 Grid Boxes with highlighted theme primary day */}
    <rect x="32" y="61" width="8" height="8" rx="2" stroke="var(--color-text, #111827)" strokeWidth="1.8" fill="none" />
    <rect x="43" y="61" width="8" height="8" rx="2" stroke="var(--color-text, #111827)" strokeWidth="1.8" fill="none" />
    <rect x="54" y="61" width="8" height="8" rx="2" fill="var(--color-primary)" stroke="var(--color-text, #111827)" strokeWidth="1.8" />
    <rect x="65" y="61" width="8" height="8" rx="2" stroke="var(--color-text, #111827)" strokeWidth="1.8" fill="none" />
  </svg>
);

/**
 * 1b. DoodleRoutine — Hand-drawn morning sun & night moon sequence
 */
export const DoodleRoutine: React.FC<DoodleProps> = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Twinkle Stars & Sparkles */}
    <path
      d="M18 20L20 23L23 24.5L20 26L18 29L16 26L13 24.5L16 23Z"
      fill="var(--tag-learning, #F59E0B)"
    />
    <path
      d="M82 22L83.5 25L86.5 26.5L83.5 28L82 31L80.5 28L77.5 26.5L80.5 25Z"
      fill="var(--tag-personal, #EC4899)"
    />

    {/* Morning Sun (Left Circle with Rays) */}
    <circle
      cx="36"
      cy="48"
      r="16"
      fill="var(--tag-learning, #F59E0B)"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
    />
    {/* Sun Rays */}
    <path d="M36 24V28" stroke="var(--tag-learning, #F59E0B)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M16 48H20" stroke="var(--tag-learning, #F59E0B)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22 34L25 37" stroke="var(--tag-learning, #F59E0B)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22 62L25 59" stroke="var(--tag-learning, #F59E0B)" strokeWidth="2.5" strokeLinecap="round" />

    {/* Night Crescent Moon (Right Shape) */}
    <path
      d="M62 34C58 40 58 56 64 62C72 70 80 66 84 60C74 62 66 52 66 44C66 38 70 34 74 32C70 31 65 32 62 34Z"
      fill="var(--color-primary)"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Connecting Orbit / Sequence Loop */}
    <path
      d="M26 72C36 82 64 82 74 72"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="4 4"
    />
    {/* Small Arrow indicator on orbit */}
    <path
      d="M71 68L76 72L71 76"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 2. DoodleCup — Serene warm tea cup with steam squiggles & sparkles
 */
export const DoodleCup: React.FC<DoodleProps> = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Steam Squiggles */}
    <path
      d="M38 28C36 22 41 18 39 12"
      stroke="var(--tag-health, #10B981)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M50 25C48 18 53 14 51 8"
      stroke="var(--color-primary)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M62 28C60 22 65 18 63 12"
      stroke="var(--tag-learning, #F59E0B)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Sparkle Twinkles */}
    <path
      d="M18 36L20 40L24 42L20 44L18 48L16 44L12 42L16 40Z"
      fill="var(--tag-learning, #F59E0B)"
    />
    <path
      d="M78 22L80 25L83 26.5L80 28L78 31L76 28L73 26.5L76 25Z"
      fill="var(--tag-personal, #EC4899)"
    />

    {/* Cup Handle */}
    <path
      d="M68 44C78 44 82 52 80 62C78 70 70 72 65 72"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Mug Body */}
    <path
      d="M26 36H70C70 36 68 76 48 76C28 76 26 36 26 36Z"
      fill="var(--color-primary)"
      fillOpacity="0.8"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Mug Cute Heart / Leaf Stamp */}
    <path
      d="M48 48C45 44 40 46 41 51C42 56 48 60 48 60C48 60 54 56 55 51C56 46 51 44 48 48Z"
      fill="#FFFFFF"
      stroke="var(--color-text, #111827)"
      strokeWidth="2"
    />

    {/* Saucer Plate */}
    <path
      d="M18 82C30 87 66 87 78 82"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 3. DoodlePlant — Potted sprout symbolizing growing habits
 */
export const DoodlePlant: React.FC<DoodleProps> = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Sun Burst Doodle Top Left */}
    <circle cx="24" cy="20" r="6" fill="var(--tag-learning, #F59E0B)" />
    <path d="M24 10V6" stroke="var(--tag-learning, #F59E0B)" strokeWidth="3" strokeLinecap="round" />
    <path d="M34 20H38" stroke="var(--tag-learning, #F59E0B)" strokeWidth="3" strokeLinecap="round" />
    <path d="M31 13L35 9" stroke="var(--tag-learning, #F59E0B)" strokeWidth="3" strokeLinecap="round" />

    {/* Right Sprout Squiggle Rays */}
    <path
      d="M75 22C79 26 83 24 86 28"
      stroke="var(--tag-health, #10B981)"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Stem */}
    <path
      d="M50 56V32"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Left Leaf */}
    <path
      d="M50 42C38 38 34 26 44 22C52 28 50 42 50 42Z"
      fill="var(--color-primary)"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Right Leaf */}
    <path
      d="M50 34C62 30 66 18 56 14C48 20 50 34 50 34Z"
      fill="var(--tag-health, #10B981)"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Pot Rim */}
    <path
      d="M30 56H70"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Pot Body */}
    <path
      d="M33 56L38 84C39 88 43 90 48 90H52C57 90 61 88 62 84L67 56"
      fill="#FFFFFF"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Pot Center Band in Theme Color */}
    <path
      d="M35 68H65"
      stroke="var(--color-primary)"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 4. DoodleMountainFlag — Mountain peak with summit flag representing long-term vision & goals
 */
export const DoodleMountainFlag: React.FC<DoodleProps> = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Twinkle Stars */}
    <path
      d="M20 20L22 24L26 26L22 28L20 32L18 28L14 26L18 24Z"
      fill="var(--tag-learning, #F59E0B)"
    />
    <path
      d="M80 30L81.5 33L84.5 34.5L81.5 36L80 39L78.5 36L75.5 34.5L78.5 33Z"
      fill="var(--tag-personal, #EC4899)"
    />

    {/* Flag Post */}
    <path
      d="M50 44V16"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Waving Flag */}
    <path
      d="M50 18C58 14 62 24 72 20V32C62 36 58 26 50 30Z"
      fill="var(--tag-learning, #F59E0B)"
      stroke="var(--color-text, #111827)"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Left Mountain Silhouette */}
    <path
      d="M12 84L38 42L60 84"
      fill="#FFFFFF"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Right Front Peak in Theme Primary */}
    <path
      d="M32 86L50 44L78 86"
      fill="var(--color-primary)"
      fillOpacity="0.85"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Snow Cap Accent */}
    <path
      d="M44 58L50 44L56 58L52 55L48 58Z"
      fill="#FFFFFF"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Ground Base */}
    <path
      d="M10 86H90"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 5. DoodleJournal — Cute notebook with checkboxes & pencil for reflections
 */
export const DoodleJournal: React.FC<DoodleProps> = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Left Spiral Loops */}
    <path d="M22 28H28" stroke="var(--color-text, #111827)" strokeWidth="3" strokeLinecap="round" />
    <path d="M22 40H28" stroke="var(--color-text, #111827)" strokeWidth="3" strokeLinecap="round" />
    <path d="M22 52H28" stroke="var(--color-text, #111827)" strokeWidth="3" strokeLinecap="round" />
    <path d="M22 64H28" stroke="var(--color-text, #111827)" strokeWidth="3" strokeLinecap="round" />

    {/* Notebook Cover Back Layer */}
    <rect
      x="22"
      y="18"
      width="56"
      height="68"
      rx="12"
      fill="var(--color-primary)"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
    />

    {/* Notebook Main Page */}
    <rect
      x="26"
      y="20"
      width="50"
      height="64"
      rx="8"
      fill="#FFFFFF"
      stroke="var(--color-text, #111827)"
      strokeWidth="3"
    />

    {/* Checkbox 1 (Checked) */}
    <rect x="34" y="32" width="7" height="7" rx="2" stroke="var(--color-text, #111827)" strokeWidth="2" fill="none" />
    <path d="M34 35L37 38L44 30" stroke="var(--tag-health, #10B981)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M48 36H66" stroke="var(--color-text, #111827)" strokeWidth="2.5" strokeLinecap="round" />

    {/* Checkbox 2 */}
    <rect x="34" y="46" width="7" height="7" rx="2" stroke="var(--color-text, #111827)" strokeWidth="2" fill="none" />
    <path d="M48 50H66" stroke="var(--color-text, #111827)" strokeWidth="2.5" strokeLinecap="round" />

    {/* Checkbox 3 */}
    <rect x="34" y="60" width="7" height="7" rx="2" stroke="var(--color-text, #111827)" strokeWidth="2" fill="none" />
    <path d="M48 64H62" stroke="var(--color-text, #111827)" strokeWidth="2.5" strokeLinecap="round" />

    {/* Floating Pencil Top Right */}
    <g transform="rotate(35 80 15)">
      <rect x="68" y="10" width="8" height="24" rx="2" fill="var(--tag-learning, #F59E0B)" stroke="var(--color-text, #111827)" strokeWidth="2" />
      <polygon points="68,34 76,34 72,40" fill="#FFFFFF" stroke="var(--color-text, #111827)" strokeWidth="2" />
      <polygon points="70,37 74,37 72,40" fill="var(--color-text, #111827)" />
    </g>
  </svg>
);

/**
 * 6. DoodleZenStones — Balanced stones for calm, mindful flow
 */
export const DoodleZenStones: React.FC<DoodleProps> = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Aura Sparkles */}
    <path
      d="M24 38C26 34 22 30 26 26"
      stroke="var(--tag-learning, #F59E0B)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M74 36L76 40L80 42L76 44L74 48L72 44L68 42L72 40Z"
      fill="var(--color-primary)"
    />

    {/* Small Top Stone */}
    <ellipse
      cx="50"
      cy="36"
      rx="12"
      ry="8"
      fill="#FFFFFF"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
    />

    {/* Middle Stone (Theme Primary) */}
    <ellipse
      cx="50"
      cy="52"
      rx="22"
      ry="11"
      fill="var(--color-primary)"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
    />

    {/* Large Bottom Stone */}
    <ellipse
      cx="50"
      cy="72"
      rx="32"
      ry="14"
      fill="#FFFFFF"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
    />

    {/* Tiny Sprout Leaf at Top */}
    <path
      d="M50 28C46 22 42 20 44 14C50 16 52 24 50 28Z"
      fill="var(--tag-health, #10B981)"
      stroke="var(--color-text, #111827)"
      strokeWidth="2"
    />
  </svg>
);

/**
 * 7. DoodleWindClouds — Swirling soothing air clouds for breathing reset
 */
export const DoodleWindClouds: React.FC<DoodleProps> = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Sparkle Twinkles */}
    <path
      d="M20 25L22 29L26 31L22 33L20 37L18 33L14 31L18 29Z"
      fill="var(--tag-personal, #EC4899)"
    />
    <path
      d="M80 65L82 69L86 71L82 73L80 77L78 73L74 71L78 69Z"
      fill="var(--tag-learning, #F59E0B)"
    />

    {/* Main Cute Cloud */}
    <path
      d="M32 60H68C76 60 82 54 82 46C82 39 77 34 70 33C69 23 59 16 48 18C40 19 34 26 33 32C26 33 20 39 20 46C20 54 26 60 32 60Z"
      fill="var(--color-primary)"
      fillOpacity="0.8"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Cute Cloud Face / Closed Eyes */}
    <path d="M42 42C44 45 48 45 50 42" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M54 42C56 45 60 45 62 42" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    {/* Rosy Cheeks */}
    <circle cx="38" cy="46" r="3" fill="var(--tag-personal, #EC4899)" />
    <circle cx="66" cy="46" r="3" fill="var(--tag-personal, #EC4899)" />

    {/* Wind Swirl Bottom */}
    <path
      d="M16 72C30 72 45 74 58 68C66 64 64 56 56 56C50 56 48 62 52 66"
      stroke="var(--color-text, #111827)"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M28 82C40 82 60 84 72 78C78 75 82 70 80 66"
      stroke="var(--tag-health, #10B981)"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/**
 * 8. DoodleAnalytics — Hand-drawn bar chart, trending growth arrow & sparkles for analytics
 */
export const DoodleAnalytics: React.FC<DoodleProps> = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Twinkle Stars */}
    <path
      d="M18 18L20 22L24 23.5L20 25L18 29L16 25L12 23.5L16 22Z"
      fill="var(--tag-learning, #F59E0B)"
    />
    <path
      d="M84 20L85.5 23L88.5 24.5L85.5 26L84 29L82.5 26L79.5 24.5L82.5 23Z"
      fill="var(--tag-personal, #EC4899)"
    />

    {/* Back Card Plate */}
    <rect
      x="18"
      y="22"
      width="64"
      height="62"
      rx="14"
      fill="var(--color-primary)"
      fillOpacity="0.12"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.5"
    />

    {/* Bar 1 (Short) */}
    <rect
      x="26"
      y="54"
      width="10"
      height="22"
      rx="3"
      fill="#FFFFFF"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.2"
    />

    {/* Bar 2 (Medium) */}
    <rect
      x="40"
      y="42"
      width="10"
      height="34"
      rx="3"
      fill="var(--tag-learning, #F59E0B)"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.2"
    />

    {/* Bar 3 (Tall - Theme Primary) */}
    <rect
      x="54"
      y="32"
      width="10"
      height="44"
      rx="3"
      fill="var(--color-primary)"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.2"
    />

    {/* Bar 4 (Peak) */}
    <rect
      x="68"
      y="24"
      width="10"
      height="52"
      rx="3"
      fill="var(--tag-health, #10B981)"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.2"
    />

    {/* Growth Trend Line with Arrow */}
    <path
      d="M24 50 L38 38 L52 28 L74 14"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M62 14 H74 V26"
      stroke="var(--color-text, #111827)"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
