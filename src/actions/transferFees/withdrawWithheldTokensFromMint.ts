import {
    Connection,
    PublicKey,
    Signer,
    Transaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
    createWithdrawWithheldTokensFromMintInstruction,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

/**
 * Withdraws withheld transfer fees from a mint account to a specified destination account.
 *
 * @param connection - The Solana connection object.
 * @param payer - The account paying for the transaction fees.
 * @param mint - The public key of the mint account.
 * @param destinationAccount - The public key of the token account to receive the withdrawn fees.
 * @param withdrawWithheldAuthority - The authority allowed to withdraw withheld fees.
 * @returns A promise that resolves to the transaction signature.
 */
export async function withdrawWithheldTokensFromMint(
    connection: Connection,
    payer: Signer,
    mint: PublicKey,
    destinationAccount: PublicKey,
    withdrawWithheldAuthority: Signer,
    signers: (Signer | PublicKey)[],
): Promise<string> {
    const transaction = new Transaction().add(
        createWithdrawWithheldTokensFromMintInstruction(
            mint,
            destinationAccount,
            withdrawWithheldAuthority.publicKey,
            signers,
            TOKEN_2022_PROGRAM_ID
        )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [payer, withdrawWithheldAuthority]);

    console.log(`Successfully withdrew withheld tokens from mint ${mint.toBase58()}.`);
    console.log(`   -> Transaction Signature: ${signature}`);

    return signature;
}
