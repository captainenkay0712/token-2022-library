import {
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';

/**
 * Requests an airdrop of SOL to the specified public key.
 *
 * @param connection - The connection to the Solana cluster.
 * @param publicKey - The public key of the account to receive the airdrop.
 * @param amount - The amount of SOL to airdrop (default is 2 SOL).
 */
export async function requestAirdrop(connection: Connection, publicKey: PublicKey, amount: number = 2): Promise<void> {
    console.log(`Requesting airdrop for ${publicKey.toBase58()}...`);
    const airdropSignature = await connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature, 'confirmed');
    console.log('Airdrop successful.');
}
