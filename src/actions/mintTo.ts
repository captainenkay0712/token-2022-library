import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
} from '@solana/web3.js';
import {
    createMintToInstruction,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

/**
 * Mints new tokens to a token account.
 *
 * @param connection    Connection to use
 * @param payer         Payer of the transaction fees
 * @param mint          The token mint address
 * @param destination   The token account to mint to
 * @param authority     The mint authority
 * @param amount        The amount of tokens to mint
 * @returns             The signature of the minting transaction
 */
export async function mintTo(
    connection: Connection,
    payer: Keypair,
    mint: PublicKey,
    destination: PublicKey,
    authority: Keypair,
    amount: bigint
): Promise<string> {
    const transaction = new Transaction().add(
        createMintToInstruction(
            mint,
            destination,
            authority.publicKey,
            amount,
            [], // multisigners
            TOKEN_2022_PROGRAM_ID
        )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [payer, authority]);

    console.log(`Successfully minted ${amount} tokens.`);
    console.log(`   -> Transaction Signature: ${signature}`);

    return signature;
}
