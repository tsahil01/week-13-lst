import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';
import { PublicKey } from "@solana/web3.js";
import { PRIVATE_KEY, TOKEN_MINT_ADDRESS } from './address';

const tokenAddress = "bjtMMTNJqZrNJCy2KooajhVrAJamZe8b16yAAjgwU1M";

export const mintTokens = async (fromAddress: string, amount: number) => {
    console.log("Minting tokens");
    const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(PRIVATE_KEY)));
    const tokenAddress = new PublicKey(TOKEN_MINT_ADDRESS);

    const sendAmout = amount * 3;

    const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');


    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        tokenAddress,
        payer.publicKey
    );

    const signature = await transfer(
        connection,
        payer,
        toTokenAccount.address,
        toTokenAccount.address,
        payer.publicKey,
        sendAmout
    );
    console.log('mint tx:', signature);

    return signature;

}

export const burnTokens = async (fromAddress: string, toAddress: string, amount: number) => {
    console.log("Burning tokens");
}

export const sendNativeTokens = async (fromAddress: string, toAddress: string, amount: number) => {
    console.log("Sending native tokens");
}



(async () => {
    // Connect to cluster
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Generate a new wallet keypair and airdrop SOL
    const fromWallet = Keypair.generate();
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);

    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature);

    // Generate a new wallet to receive newly minted token
    const toWallet = Keypair.generate();

    // Create new token mint
    const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);

    // Get the token account of the fromWallet address, and if it does not exist, create it
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );

    // Get the token account of the toWallet address, and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey);

    // Mint 1 new token to the "fromTokenAccount" account we just created
    let signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        fromWallet.publicKey,
        1000000000
    );
    console.log('mint tx:', signature);

    // Transfer the new token to the "toTokenAccount" we just created
    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        50
    );
})();