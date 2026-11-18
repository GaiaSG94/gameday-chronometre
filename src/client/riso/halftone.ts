/* Geometry of the printed lanes. */

/** The finish line always sits where the locked board prints it (7.30 s on a 10 s lap). */
export const FINISH_DEG = 262.8;
/** Your mark is placed by your gap: 1 s = 36° (a 10 s lap), clamped so it stays on the lanes. */
export const DEG_PER_SECOND = 36;
export const markAngle = (gap: number): number => FINISH_DEG + Math.max(-150, Math.min(150, gap * DEG_PER_SECOND));

type Dot = { x: number; y: number; r: number };

/** Real halftone: dot size follows the shading, 8 px grid rotated 15°. */
export const halftone = (cx: number, cy: number, radius: number): Dot[] => {
  const a = (15 * Math.PI) / 180;
  const dots: Dot[] = [];
  for (let y = -radius; y <= radius; y += 8) {
    for (let x = -radius; x <= radius; x += 8) {
      if (Math.hypot(x, y) > radius) continue;
      const l = Math.hypot(x + radius * 0.45, y + radius * 0.45) / (radius * 1.9);
      dots.push({
        x: cx + x * Math.cos(a) - y * Math.sin(a),
        y: cy + x * Math.sin(a) + y * Math.cos(a),
        r: Math.max(0.5, Math.min(4.4, 4.6 * l + 0.4)),
      });
    }
  }
  return dots;
};
