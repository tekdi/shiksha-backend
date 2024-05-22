import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv } from 'crypto';


const secretKey = Buffer.from(process.env.SECRET_KEY, 'base64');

export function encrypt(data: string): string {
    const cipher = createCipheriv('aes-256-ecb', secretKey, null);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]).toString('base64');
    return encrypted;
  }

  export function decrypt(encryptedData: string): string {
    const decipher = createDecipheriv('aes-256-ecb', secretKey, null);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedData, 'base64')), decipher.final()]).toString('utf8');
    return decrypted;
  }


export function maskMobileNumber(mobileNumber: any): string {
    const mobileNumberStr = String(mobileNumber);
    if (mobileNumberStr.length !== 10) {
        throw new Error('Mobile number must be 10 digits long');
    }
    const prefix = mobileNumberStr.substring(0, 2);
    const suffix = mobileNumberStr.substring(8, 10);
    return `${prefix}******${suffix}`;
}

export function maskEmail(email: string): string {
    if (typeof email !== 'string' || !email.includes('@')) {
        throw new Error('Invalid email address');
    }
    const [localPart, domain] = email.split('@');
    if (localPart.length < 2) {
        throw new Error('Invalid email address');
    }
    const maskedLocalPart = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
    return `${maskedLocalPart}@${domain}`;
}


export function isValidDateFormat(date: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
}

export function maskDateOfBirth(dob: string): string {
    if (!isValidDateFormat(dob)) {
        throw new Error('Invalid date of birth format. Expected format: YYYY-MM-DD');
    }
    return `****${dob.substring(4)}`;
}


