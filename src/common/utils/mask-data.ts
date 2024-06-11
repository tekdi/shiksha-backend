import { createCipheriv, createDecipheriv } from 'node:crypto';

const secretKey = Buffer.from(process.env.SECRET_KEY, 'base64');

// Encrypts the given data
export function encrypt(data: string): string {
    const cipher = createCipheriv('aes-256-ecb', secretKey, null);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]).toString('base64');
    return encrypted;
}

// Decrypts the given encrypted data
export function decrypt(encryptedData: string): string {
    const decipher = createDecipheriv('aes-256-ecb', secretKey, null);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedData, 'base64')), decipher.final()]).toString('utf8');
    return decrypted;
}

// Masks the given data
export function maskPiiData(fieldType: string, fieldValue: string) {
    let maskData;
    switch (fieldType) {

        case 'email':
            const [localPart, domain] = fieldValue.split('@');
            const maskedLocalPart = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
            maskData = `${maskedLocalPart}@${domain}`;
            break;

        case 'mobile':
            const prefix = fieldValue.substring(0, 2);
            const suffix = fieldValue.substring(8, 10);
            maskData = `${prefix}******${suffix}`;
            break;

        case 'date':
            maskData = `****${fieldValue.substring(4)}`;
            break;

        default:
            break;
    }
    return maskData;
}


// Validates the date format


