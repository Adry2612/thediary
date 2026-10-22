export interface TabTextToken {
  text: string;
  kind: "text" | "fret";
}

/**
 * Divide una línea de tablatura en texto y números de traste sin cambiar un
 * solo carácter: al unir los tokens se recupera la línea original.
 */
export function tokenizeTabLine(line: string): TabTextToken[] {
  const tokens: TabTextToken[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(/\d+/g)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, index), kind: "text" });
    }
    tokens.push({ text: match[0], kind: "fret" });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), kind: "text" });
  }

  return tokens;
}
