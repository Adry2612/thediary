function createRandomHex(length: number): string {
  const randomValues = globalThis.crypto?.getRandomValues;

  if (randomValues) {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    randomValues.call(globalThis.crypto, bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, length);
  }

  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export function createId(): string {
  const randomUuid = globalThis.crypto?.randomUUID;
  if (randomUuid) return randomUuid.call(globalThis.crypto);

  const timestamp = Date.now().toString(16).padStart(12, "0");
  const random = createRandomHex(20);
  return `${timestamp.slice(0, 8)}-${timestamp.slice(8)}-4${random.slice(0, 3)}-${random.slice(3, 7)}-${random.slice(7)}`;
}
