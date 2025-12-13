import CryptoMain from 'crypto';
const algorithm = 'aes-256-cbc';
const ivLength = 16;

export function encryptUserData(data) {
    if(data === undefined){
        return false;
    }
    const iv = CryptoMain.randomBytes(ivLength);
    const key = Buffer.from(process.env.PASS_SEC, 'hex');
    const cipher = CryptoMain.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptUserData(encryptedData) {
  if (!encryptedData || typeof encryptedData !== "string") {
    console.error("decryptUserData error: invalid input:", encryptedData);
    return null;
  }

  try {
    // 🔥 Important
    encryptedData = decodeURIComponent(encryptedData);

    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      console.error("decryptUserData error: invalid encrypted format:", encryptedData);
      return null;
    }

    const [iv, encrypted] = parts;

    const key = Buffer.from(process.env.PASS_SEC, 'hex');
    const decipher = CryptoMain.createDecipheriv(
      algorithm,
      key,
      Buffer.from(iv, 'hex')
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error("decryptUserData error:", err.message);
    return null;
  }
}

export function encryptCompanyPassword(plainTextPassword) {
    if(plainTextPassword === undefined){
        return false;
    }
    const iv = CryptoMain.randomBytes(ivLength);
    const key = Buffer.from(process.env.PASS_SEC, 'hex');
    const cipher = CryptoMain.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(plainTextPassword, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

export function decryptCompanyPassword(encryptedPassword) {
    if(encryptedPassword === undefined){
        return false;
    }
    const [ivHex, encryptedHex] = encryptedPassword.split(':');
    const key = Buffer.from(process.env.PASS_SEC, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = CryptoMain.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
