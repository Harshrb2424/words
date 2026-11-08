import type { CSSProperties } from "react";

export type CSSVariableStyle = CSSProperties & Record<`--${string}`, string | number>;

/** Builds an inline style object that also accepts CSS custom properties. */
export function cssVariables(
  values: Record<string, string | number | undefined>
): CSSVariableStyle {
  return values as CSSVariableStyle;
}
