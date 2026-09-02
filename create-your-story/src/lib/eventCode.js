import { customAlphabet } from "nanoid";

// 32-character alphabet excluding visually ambiguous characters (0/O, 1/I/L)
// so codes read cleanly off a printed QR card or when typed in by hand.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const generate = customAlphabet(ALPHABET, 6);

export function generateEventCode() {
  return generate();
}
