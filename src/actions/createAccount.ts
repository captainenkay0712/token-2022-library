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
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

/**
 * Creates an associated token account for a Token-2022 mint.
 *
 * @param connection    Connection to use
 * @param payer         Payer of the transaction fees
 * @param mint          The token mint address
 * @param owner         The owner of the new token account
 * @param tokenProgramId The program ID of the token program (default: TOKEN_PROGRAM_ID)
 * @returns             The address of the created associated token account
 */
export async function createAssociatedTokenAccount(
    connection: Connection,
    payer: Keypair,
    mint: PublicKey,
    owner: PublicKey,
    tokenProgramId: PublicKey = TOKEN_PROGRAM_ID
): Promise<PublicKey> {
    const associatedTokenAddress = getAssociatedTokenAddressSync(
        mint,
        owner,
        false, // allowOwnerOffCurve
        tokenProgramId,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
            payer.publicKey,
            associatedTokenAddress,
            owner,
            mint,
            tokenProgramId,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
    );

    await sendAndConfirmTransaction(connection, transaction, [payer]);

    console.log(`Successfully created an Associated Token Account.`);
    console.log(`   -> Account Address: ${associatedTokenAddress.toBase58()}`);

    return associatedTokenAddress;
}
