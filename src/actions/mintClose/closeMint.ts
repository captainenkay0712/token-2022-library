import {
    Connection,
    Keypair,
    Signer,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
} from '@solana/web3.js';
import {
    createCloseAccountInstruction,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

/**
 * Closes a mint account by the close authority.
 *
 * @param connection - The Solana connection object.
 * @param payer - The account paying for the transaction fees.
 * @param mint - The public key of the mint to close.
 * @param closeAuthority - The keypair of the account authorized to close the mint.
 * @param destination - The public key of the account to receive the lamports from the closed mint.
 * @returns The signature of the confirmed transaction.
 */
export async function closeMint(
    connection: Connection,
    payer: Keypair,
    mint: PublicKey,
    closeAuthority: Keypair,
    destination: PublicKey,
    multiSigners: (Signer | PublicKey)[] = [],
): Promise<string> {
    const transaction = new Transaction().add(
        createCloseAccountInstruction(
            mint,
            destination,
            closeAuthority.publicKey,
            multiSigners,
            TOKEN_2022_PROGRAM_ID
        )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [
        payer,
        closeAuthority,
    ]);

    console.log(`Successfully closed mint ${mint.toBase58()}.`);
    console.log(`   -> Transaction Signature: ${signature}`);

    return signature;
}
