import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { KeyData, KeyStorageProvider } from '../interfaces/key-storage.interface';

@Injectable()
export class EncryptedFileStorageProvider implements KeyStorageProvider {
  private readonly logger = new Logger(EncryptedFileStorageProvider.name);
  private readonly storageDir: string;
  private readonly encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    this.storageDir = path.join(process.cwd(), 'storage', 'keys');
    
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
    
    const key = this.configService.get<string>('keyManagement.encryptionKey');
    if (!key) {
      throw new Error('Encryption key is not configured');
    }
    
    this.encryptionKey = crypto.scryptSync(key, 'salt', 32);
  }

  async storeKey(userId: string, keyData: KeyData): Promise<void> {
    try {
      const filePath = this.getKeyFilePath(userId);
      const encryptedData = this.encryptData(JSON.stringify(keyData));
      
      fs.writeFileSync(filePath, encryptedData);
      this.logger.log(`Stored key for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to store key for user ${userId}`, error);
      throw new Error(`Key storage failed: ${error.message}`);
    }
  }

  async getKey(userId: string): Promise<KeyData> {
    try {
      const filePath = this.getKeyFilePath(userId);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Key not found for user ${userId}`);
      }
      
      const encryptedData = fs.readFileSync(filePath, 'utf8');
      const decryptedData = this.decryptData(encryptedData);
      
      return JSON.parse(decryptedData);
    } catch (error) {
      this.logger.error(`Failed to retrieve key for user ${userId}`, error);
      throw new Error(`Key retrieval failed: ${error.message}`);
    }
  }

  async rotateKey(userId: string): Promise<KeyData> {
    // In a real scenario, you'd generate a new key and update storage
    // For demo purposes, we'll just return the existing key
    return this.getKey(userId);
  }

  async deleteKey(userId: string): Promise<boolean> {
    try {
      const filePath = this.getKeyFilePath(userId);
      
      if (!fs.existsSync(filePath)) {
        return false;
      }
      
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete key for user ${userId}`, error);
      return false;
    }
  }

  async checkKeyHealth(userId: string): Promise<boolean> {
    try {
      await this.getKey(userId);
      return true;
    } catch {
      return false;
    }
  }

  private getKeyFilePath(userId: string): string {
    const sanitizedId = userId.replace(/[^a-zA-Z0-9]/g, '_');
    return path.join(this.storageDir, `${sanitizedId}.enc`);
  }

  private encryptData(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decryptData(encryptedData: string): string {
    const [ivHex, encryptedText] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
