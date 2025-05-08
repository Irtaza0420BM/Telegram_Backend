export interface KeyData {
    publicKey: string;
    encryptedPrivateKey?: string;
    mnemonicPhrase?: string;
    keyId?: string;
  }
  
  export interface KeyStorageProvider {
    storeKey(userId: string, keyData: KeyData): Promise<void>;
    getKey(userId: string): Promise<KeyData>;
    rotateKey(userId: string): Promise<KeyData>;
    deleteKey(userId: string): Promise<boolean>;
    checkKeyHealth(userId: string): Promise<boolean>;
  }
  