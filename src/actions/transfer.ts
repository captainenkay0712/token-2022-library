import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
} from '@solana/web3.js';
import {
    getMint,
    getTransferFeeConfig,
    calculateFee,
    createTransferCheckedWithFeeInstruction,
    TOKEN_2022_PROGRAM_ID,
    unpackAccount,
    getTransferFeeAmount,
} from '@solana/spl-token';

/**
 * Transfers tokens from a source account to a destination account, accounting for transfer fees.
 *
 * @param connection    Connection to use
 * @param payer         Payer of the transaction fees
 * @param source        The source token account
 * @param mint          The token mint address
 * @param destination   The destination token account
 * @param owner         The owner of the source token account
 * @param amount        The amount of tokens to transfer
 * @param decimals      The number of decimals for the token
 * @returns             The signature of the transfer transaction
 */
export async function transfer(
    connection: Connection,
    payer: Keypair,
    source: PublicKey,
    mint: PublicKey,
    destination: PublicKey,
    owner: Keypair,
    amount: bigint,
    decimals: number
): Promise<string> {
    const mintInfo = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    const transferFeeConfig = getTransferFeeConfig(mintInfo);

    if (!transferFeeConfig) {
        throw new Error('Transfer fee config not found on the mint account.');
    }

    const fee = calculateFee(
        transferFeeConfig.newerTransferFee,
        amount
    );

    const transaction = new Transaction().add(
        createTransferCheckedWithFeeInstruction(
            source,
            mint,
            destination,
            owner.publicKey,
            amount,
            decimals,
            fee,
            [], // multisigners
            TOKEN_2022_PROGRAM_ID
        )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [payer, owner]);

    console.log(`Successfully transferred ${amount} tokens.`);
    console.log(`   -> Transaction Signature: ${signature}`);

    return signature;
}
