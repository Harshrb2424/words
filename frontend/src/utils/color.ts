/**
 * Dynamic Quote Accent Color Utilities
 */

interface AccentStyles {
  textColor: string;
  bgColor: string;
  borderColor: string;
  rawColor: string;
}

/**
 * Returns elegant CSS styles (textColor, bgColor, borderColor) 
 * for an accent based on a hex color code, defaulting to the warm amber accent.
 */
export function getAccentStyles(hexColor?: string): AccentStyles {
  const defaultHex = "#d97706"; // Amber accent default
  const color = (hexColor && hexColor.startsWith("#") && hexColor.length === 7) ? hexColor : defaultHex;

  // Extract RGB components
  const r = parseInt(color.substring(1, 3), 16) || 217;
  const g = parseInt(color.substring(3, 5), 16) || 119;
  const b = parseInt(color.substring(5, 7), 16) || 6;

  return {
    textColor: color,
    bgColor: `rgba(${r}, ${g}, ${b}, 0.15)`,   // 15% opacity for solid high-contrast reading
    borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`, // 30% opacity for gentle, aesthetic outlining
    rawColor: color
  };
}
