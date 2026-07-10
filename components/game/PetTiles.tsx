// Paw Match tile art — six pet-themed SVG tiles. Each tile pairs a distinct
// hue with a distinct SHAPE so the board stays readable for color-blind
// players. Fills are literal (game art, not themed UI) and read well on the
// token-driven board background in both light and dark mode.

export const TILE_TYPES = 6;

const S = { width: '78%', height: '78%', display: 'block' } as const;

function Cat() {
  return (
    <svg viewBox="0 0 48 48" style={S} aria-hidden>
      <path d="M10 14 L16 5 L20 13 Z" fill="#E8833A" />
      <path d="M38 14 L32 5 L28 13 Z" fill="#E8833A" />
      <circle cx="24" cy="26" r="16" fill="#F0A05A" />
      <circle cx="18" cy="24" r="2.4" fill="#3A2415" />
      <circle cx="30" cy="24" r="2.4" fill="#3A2415" />
      <path d="M21.5 31 Q24 33.5 26.5 31" stroke="#3A2415" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M24 27.5 L22.3 29.6 Q24 31 25.7 29.6 Z" fill="#C2622A" />
    </svg>
  );
}

function Dog() {
  return (
    <svg viewBox="0 0 48 48" style={S} aria-hidden>
      <ellipse cx="11" cy="20" rx="6" ry="10" fill="#7A5233" />
      <ellipse cx="37" cy="20" rx="6" ry="10" fill="#7A5233" />
      <circle cx="24" cy="26" r="16" fill="#A9805A" />
      <ellipse cx="24" cy="32" rx="8" ry="6.5" fill="#D9BC9C" />
      <circle cx="18" cy="23" r="2.4" fill="#2A1B0F" />
      <circle cx="30" cy="23" r="2.4" fill="#2A1B0F" />
      <ellipse cx="24" cy="30" rx="3.2" ry="2.6" fill="#2A1B0F" />
    </svg>
  );
}

function Fish() {
  return (
    <svg viewBox="0 0 48 48" style={S} aria-hidden>
      <path d="M6 24 Q14 12 27 12 Q40 12 43 24 Q40 36 27 36 Q14 36 6 24 Z" fill="#4C9ED9" />
      <path d="M6 24 L-1 15 L2 24 L-1 33 Z" fill="#3C7FB0" transform="translate(8 0)" />
      <circle cx="33" cy="21" r="2.4" fill="#0F2A3C" />
      <path d="M22 14 Q26 24 22 34" stroke="#3C7FB0" strokeWidth="2.4" fill="none" />
    </svg>
  );
}

function Bone() {
  return (
    <svg viewBox="0 0 48 48" style={S} aria-hidden>
      <g fill="#EFE3D2" stroke="#CBB79C" strokeWidth="1.6">
        <circle cx="12" cy="15" r="6" />
        <circle cx="15" cy="12" r="6" />
        <circle cx="33" cy="36" r="6" />
        <circle cx="36" cy="33" r="6" />
        <rect x="11" y="19" width="26" height="10" rx="5" transform="rotate(45 24 24)" />
      </g>
    </svg>
  );
}

function PawPrint() {
  return (
    <svg viewBox="0 0 48 48" style={S} aria-hidden>
      <g fill="#C8490A">
        <ellipse cx="13" cy="20" rx="4.4" ry="5.6" />
        <ellipse cx="35" cy="20" rx="4.4" ry="5.6" />
        <ellipse cx="19.5" cy="12.5" rx="4.2" ry="5.2" />
        <ellipse cx="28.5" cy="12.5" rx="4.2" ry="5.2" />
        <path d="M24 22c-5.8 0-10.4 4.4-10.4 9.2 0 3.8 2.9 6.2 6.6 6.2 1.9 0 2.9-.7 3.8-.7s1.9.7 3.8.7c3.7 0 6.6-2.4 6.6-6.2C34.4 26.4 29.8 22 24 22z" />
      </g>
    </svg>
  );
}

function Heart() {
  return (
    <svg viewBox="0 0 48 48" style={S} aria-hidden>
      <path d="M24 41 C10 31 5 23 5 16.5 C5 10.5 9.5 6 15.2 6 C19 6 22.3 8 24 11 C25.7 8 29 6 32.8 6 C38.5 6 43 10.5 43 16.5 C43 23 38 31 24 41 Z" fill="#D9536B" />
      <ellipse cx="16" cy="14" rx="3.4" ry="2.4" fill="#E8899B" transform="rotate(-25 16 14)" />
    </svg>
  );
}

const TILES = [Cat, Dog, Fish, Bone, PawPrint, Heart];
export const TILE_BG = ['#FBE8D8', '#F1E4D4', '#DCEBF6', '#F6F1E7', '#FDE4D4', '#F9DFE4'];
export const TILE_BG_DARK = ['#3A2B1C', '#33291D', '#1E2E3C', '#332F24', '#3A2418', '#38222A'];

export function PetTile({ type }: { type: number }) {
  const Tile = TILES[type % TILES.length];
  return <Tile />;
}
