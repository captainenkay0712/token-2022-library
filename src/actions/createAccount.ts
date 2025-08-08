import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
} from '@solana/web3.js';
import {
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddressSync,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

/**
 * Creates an associated token account for a Token-2022 mint.
 *
 * @param connection    Connection to use
 * @param payer         Payer of the transaction fees
 * @param mint          The token mint address
 * @param owner         The owner of the new token account
 * @returns             The address of the created associated token account
 */
export async function createAssociatedTokenAccount(
    connection: Connection,
    payer: Keypair,
    mint: PublicKey,
    owner: PublicKey
): Promise<PublicKey> {
    const associatedTokenAddress = getAssociatedTokenAddressSync(
        mint,
        owner,
        false, // allowOwnerOffCurve
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
            payer.publicKey,
            associatedTokenAddress,
            owner,
            mint,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
    );

    await sendAndConfirmTransaction(connection, transaction, [payer]);

    console.log(`Successfully created an Associated Token Account.`);
    console.log(`   -> Account Address: ${associatedTokenAddress.toBase58()}`);

    return associatedTokenAddress;
}
