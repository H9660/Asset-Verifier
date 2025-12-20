import crypto from "crypto";
export const generateNonce = (totalbytes) => {
  // Generate 16 bytes of random data (128 bits)
  const nonceBytes = crypto.randomBytes(16);

  // Encode the bytes as a Base64 string
  const nonce = nonceBytes.toString("base64");

  return nonce;
};
