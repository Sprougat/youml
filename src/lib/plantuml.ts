import pako from "pako";

// PlantUML custom base64 alphabet
const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

function encode6bit(b: number): string {
  return ALPHABET.charAt(b & 0x3f);
}

function append3bytes(b1: number, b2: number, b3: number): string {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;
  return encode6bit(c1) + encode6bit(c2) + encode6bit(c3) + encode6bit(c4);
}

function encode64(data: Uint8Array): string {
  let r = "";
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) r += append3bytes(data[i], data[i + 1], 0);
    else if (i + 1 === data.length) r += append3bytes(data[i], 0, 0);
    else r += append3bytes(data[i], data[i + 1], data[i + 2]);
  }
  return r;
}

export function encodePlantUML(source: string): string {
  const utf8 = new TextEncoder().encode(source);
  const deflated = pako.deflateRaw(utf8, { level: 9 });
  return encode64(deflated);
}

export const PLANTUML_SERVER = "https://www.plantuml.com/plantuml";

export function plantumlUrl(source: string, format: "svg" | "png" = "svg") {
  return `${PLANTUML_SERVER}/${format}/${encodePlantUML(source)}`;
}
