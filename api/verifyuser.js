import crypto from "crypto";

const algorithm = "aes-256-cbc";
const IV_LENGTH = 16;

function getKey() {
  const key = Buffer.from(process.env.PASS_SEC, "hex");
  if (key.length !== 32) {
    throw new Error("PASS_SEC must be 32 bytes (64 hex chars)");
  }
  return key;
}

export function encryptUserData(data) {
  if (!data) return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(String(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function decryptUserData(encryptedData) {
  try {
    if (!encryptedData) return null;

    // ✅ decode URL-encoded string
    const decoded = decodeURIComponent(encryptedData).trim();

    if (!decoded.includes(":")) return null;

    const [ivHex, encryptedHex] = decoded.split(":");

    const iv = Buffer.from(ivHex, "hex");
    if (iv.length !== IV_LENGTH) return null;

    const key = getKey();

    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    return null;
  }
}

export function encryptCompanyPassword(password) {
  if (!password) return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}


export function decryptCompanyPassword(encryptedPassword) {
  try {
    if (!encryptedPassword || !encryptedPassword.includes(":")) {
      return null;
    }

    const [ivHex, encryptedHex] = encryptedPassword.split(":");

    const iv = Buffer.from(ivHex, "hex");
    if (iv.length !== IV_LENGTH) return null;

    const key = getKey();

    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    return null;
  }
}


// import CryptoMain from 'crypto';
// const algorithm = 'aes-256-cbc';
// const ivLength = 16;

// export function encryptUserData(data) {
//     if(data === undefined){
//         return false;
//     }
//     const iv = CryptoMain.randomBytes(ivLength);
//     const key = Buffer.from(process.env.PASS_SEC, 'hex');
//     const cipher = CryptoMain.createCipheriv(algorithm, key, iv);
//     let encrypted = cipher.update(data, 'utf8', 'hex');
//     encrypted += cipher.final('hex');
//     return `${iv.toString('hex')}:${encrypted}`;
// }

// export function decryptUserData(encryptedData) {
//   if (!encryptedData || typeof encryptedData !== "string") {
//     console.error("decryptUserData error: invalid input:", encryptedData);
//     return null;
//   }

//   try {
//     // 🔥 Important
//     encryptedData = decodeURIComponent(encryptedData);

//     const parts = encryptedData.split(':');
//     if (parts.length !== 2) {
//       console.error("decryptUserData error: invalid encrypted format:", encryptedData);
//       return null;
//     }

//     const [iv, encrypted] = parts;

//     const key = Buffer.from(process.env.PASS_SEC, 'hex');
//     const decipher = CryptoMain.createDecipheriv(
//       algorithm,
//       key,
//       Buffer.from(iv, 'hex')
//     );

//     let decrypted = decipher.update(encrypted, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');

//     return decrypted;
//   } catch (err) {
//     console.error("decryptUserData error:", err.message);
//     return null;
//   }
// }

// export function encryptCompanyPassword(plainTextPassword) {
//     if(plainTextPassword === undefined){
//         return false;
//     }
//     const iv = CryptoMain.randomBytes(ivLength);
//     const key = Buffer.from(process.env.PASS_SEC, 'hex');
//     const cipher = CryptoMain.createCipheriv(algorithm, key, iv);
//     let encrypted = cipher.update(plainTextPassword, 'utf8', 'hex');
//     encrypted += cipher.final('hex');
//     return `${iv.toString('hex')}:${encrypted}`;
// };

// export function decryptCompanyPassword(encryptedPassword) {
//     if(encryptedPassword === undefined){
//         return false;
//     }
//     const [ivHex, encryptedHex] = encryptedPassword.split(':');
//     const key = Buffer.from(process.env.PASS_SEC, 'hex');
//     const iv = Buffer.from(ivHex, 'hex');
//     const decipher = CryptoMain.createDecipheriv(algorithm, key, iv);
//     let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');
//     return decrypted;
// };
