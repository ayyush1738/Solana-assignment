import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

const DEVNET_URL = 'https://api.devnet.solana.com';
export const connection = new Connection(DEVNET_URL, 'confirmed');

export const getWalletBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

export const createNewToken = async (wallet: any): Promise<string> => {
  try {
    const mint = await createMint(
      connection,
      wallet,
      wallet.publicKey,
      null,
      6 // 6 decimals
    );
    return mint.toString();
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
};

export const mintTokens = async (
  wallet: any,
  mintAddress: string,
  amount: number
): Promise<string> => {
  try {
    const mint = new PublicKey(mintAddress);
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mint,
      wallet.publicKey
    );

    const signature = await mintTo(
      connection,
      wallet,
      mint,
      tokenAccount.address,
      wallet.publicKey,
      amount * Math.pow(10, 6) // 6 decimals
    );

    return signature;
  } catch (error) {
    console.error('Error minting tokens:', error);
    throw error;
  }
};

export const sendTokens = async (
  wallet: any,
  mintAddress: string,
  recipientAddress: string,
  amount: number
): Promise<string> => {
  try {
    const mint = new PublicKey(mintAddress);
    const recipient = new PublicKey(recipientAddress);

    const sourceAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mint,
      wallet.publicKey
    );

    const destinationAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mint,
      recipient
    );

    const signature = await transfer(
      connection,
      wallet,
      sourceAccount.address,
      destinationAccount.address,
      wallet.publicKey,
      amount * Math.pow(10, 6) // 6 decimals
    );

    return signature;
  } catch (error) {
    console.error('Error sending tokens:', error);
    throw error;
  }
};

export const getTokenBalance = async (
  walletAddress: string,
  mintAddress: string
): Promise<number> => {
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const mint = new PublicKey(mintAddress);
    
    const tokenAccounts = await connection.getTokenAccountsByOwner(
      walletPublicKey,
      { mint }
    );

    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    const accountInfo = await getAccount(connection, tokenAccounts.value[0].pubkey);
    return Number(accountInfo.amount) / Math.pow(10, 6);
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
};