// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { TonClient } from '@ton/ton';
// import { Address, beginCell, sign } from '@ton/core';
// import { mnemonicToPrivateKey } from '@ton/crypto';
// import { KeyPair, TonConnectError } from '@ton/ton-connect';

// @Injectable()
// export class TonConnectionService implements OnModuleInit {
//   private readonly logger = new Logger(TonConnectionService.name);
//   private clients: Map<string, TonClient> = new Map();
//   private activeEndpoint: string;
//   private readonly maxRetries = 3;
//   private readonly retryDelay = 1000;

//   constructor(private configService: ConfigService) {}

//   async onModuleInit() {
//     await this.initializeConnections();
//   }

//   private async initializeConnections() {
//     const endpoints = this.configService.get<string[]>('ton.endpoints');
//     const environment = this.configService.get<string>('NODE_ENV') || 'development';
    
//     this.logger.log(`Initializing TON connections for ${environment} environment`);
    
//     for (const endpoint of endpoints) {
//       try {
//         const client = new TonClient({
//           endpoint,
//           apiKey: this.configService.get<string>('ton.apiKey'),
//         });
        
//         await client.getLastBlock();
        
//         this.clients.set(endpoint, client);
//         if (!this.activeEndpoint) {
//           this.activeEndpoint = endpoint;
//           this.logger.log(`Set primary TON endpoint to ${endpoint}`);
//         }
//       } catch (error) {
//         this.logger.error(`Failed to connect to TON endpoint ${endpoint}`, error);
//       }
//     }
    
//     if (!this.activeEndpoint) {
//       throw new Error('Failed to connect to any TON endpoint');
//     }
//   }

//   getClient(): TonClient {
//     if (!this.activeEndpoint || !this.clients.has(this.activeEndpoint)) {
//       throw new Error('No active TON client available');
//     }
//     return this.clients.get(this.activeEndpoint);
//   }

//   async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
//     let attempts = 0;
//     let lastError: Error;

//     while (attempts < this.maxRetries) {
//       try {
//         return await operation();
//       } catch (error) {
//         lastError = error;
//         attempts++;
//         this.logger.warn(`Operation failed, retrying (${attempts}/${this.maxRetries})`, error);
        
//         if (attempts >= this.maxRetries) {
//           this.switchToFallbackEndpoint();
//         }
        
//         await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempts));
//       }
//     }
    
//     throw lastError;
//   }

//   private switchToFallbackEndpoint() {
//     const endpoints = Array.from(this.clients.keys());
//     if (endpoints.length <= 1) {
//       this.logger.warn('No fallback endpoints available');
//       return;
//     }
    
//     const currentIndex = endpoints.indexOf(this.activeEndpoint);
//     const nextIndex = (currentIndex + 1) % endpoints.length;
//     this.activeEndpoint = endpoints[nextIndex];
//     this.logger.log(`Switched to fallback TON endpoint: ${this.activeEndpoint}`);
//   }

//   async checkHealth(): Promise<boolean> {
//     try {
//       const client = this.getClient();
//       await client.getLastBlock();
//       return true;
//     } catch (error) {
//       this.logger.error('Health check failed', error);
//       return false;
//     }
//   }

//   /**
//    * Generates a challenge message for wallet verification
//    * @returns The challenge string and its expiration timestamp
//    */
//   generateWalletChallenge(): { challenge: string; expireAt: number } {
//     const randomBytes = new Uint8Array(32);
//     crypto.getRandomValues(randomBytes);
//     const challenge = Buffer.from(randomBytes).toString('hex');
    
//     const expireAt = Math.floor(Date.now() / 1000) + 600;
    
//     return { challenge, expireAt };
//   }

//   /**
//    * Creates a message to be signed for wallet verification
//    * @param address Wallet address
//    * @param challenge Random challenge string
//    * @param expireAt Expiration timestamp
//    * @returns Cell message ready to be signed
//    */
//   createSignatureMessage(address: string, challenge: string, expireAt: number) {
//     return beginCell()
//       .storeUint(0x1234567890ABCDEF, 64) 
//       .storeAddress(Address.parse(address))
//       .storeBuffer(Buffer.from(challenge, 'hex'))
//       .storeUint(expireAt, 32)
//       .endCell();
//   }

//   /**
//    * Verifies a wallet signature against a challenge
//    * @param address Wallet address to verify
//    * @param challenge The challenge string that was signed
//    * @param signature The signature produced by the wallet
//    * @param expireAt Expiration timestamp of the challenge
//    * @returns Boolean indicating if the signature is valid
//    */
//   async verifyWalletSignature(address: string, challenge: string, signature: string, expireAt: number): Promise<boolean> {
//     try {
//       const currentTime = Math.floor(Date.now() / 1000);
//       if (currentTime > expireAt) {
//         this.logger.warn(`Challenge expired for address ${address}`);
//         return false;
//       }

//       const client = this.getClient();
//       const walletInfo = await client.getContractState(Address.parse(address));
      
//       if (!walletInfo) {
//         this.logger.warn(`Wallet not found: ${address}`);
//         return false;
//       }

//       const message = this.createSignatureMessage(address, challenge, expireAt);
      
//       // This is a simplified example - real implementation would need to handle different wallet types
//       const publicKey = await this.getWalletPublicKey(address);
      
//       if (!publicKey) {
//         this.logger.warn(`Could not retrieve public key for wallet: ${address}`);
//         return false;
//       }
      
//       const signatureBuffer = Buffer.from(signature, 'hex');
//       const isValid = await this.executeWithRetry(() => 
//         this.verifySignature(message.hash(), publicKey, signatureBuffer)
//       );
      
//       return isValid;
//     } catch (error) {
//       this.logger.error(`Error verifying wallet signature: ${error.message}`, error);
//       return false;
//     }
//   }

//   private async getWalletPublicKey(address: string): Promise<Buffer | null> {
//     try {
//       const client = this.getClient();
//       // This is a simplified implementation
//       // You would need to fetch the contract data and extract the public key
//       // based on the specific wallet contract type

//       // For v4R2 wallets, we can get the public key from the data section
//       const { state } = await client.getContractState(Address.parse(address));
      
//       if (!state?.data) {
//         return null;
//       }
      
//       // Parse the public key from the contract data
//       // This implementation is specific to standard TON wallets
//       // Different wallet types may store the public key differently
//       const data = Buffer.from(state.data, 'base64');
      
//       // For v4R2 wallets, public key is stored at the beginning of data
//       // Skip first 32 bytes (seqno + some data) and take the next 32 bytes
//       const publicKey = data.slice(32, 64);
      
//       return publicKey;
//     } catch (error) {
//       this.logger.error(`Failed to get wallet public key: ${error.message}`, error);
//       return null;
//     }
//   }

//   /**
//    * Verifies a signature using the given hash, public key, and signature
//    */
//   private async verifySignature(hash: Buffer, publicKey: Buffer, signature: Buffer): Promise<boolean> {
//     try {
//       // Use @ton/crypto for signature verification
//       const { sign } = await import('@ton/crypto');
//       return sign.signVerify(hash, signature, publicKey);
//     } catch (error) {
//       this.logger.error(`Signature verification error: ${error.message}`, error);
//       return false;
//     }
//   }
// }