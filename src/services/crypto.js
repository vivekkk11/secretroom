const enc = new TextEncoder();
const dec = new TextDecoder();

export async function createAESKey(roomId) {
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(roomId),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("aes-chat-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function aesEncrypt(text, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );

  return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
}

export async function aesDecrypt(payload, key) {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(payload.iv) },
    key,
    new Uint8Array(payload.data)
  );

  return dec.decode(decrypted);
}
