import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
} from '@solana/web3.js';
import {
    createHarvestWithheldTokensToMintInstruction,
    getTransferFeeAmount,
    unpackAccount,
    TOKEN_2022_PROGRAM_ID,
    ACCOUNT_SIZE,
} from '@solana/spl-token';

/**
 * Harvests withheld transfer fees from multiple token accounts to the mint.
 *
 * @param connection - The Solana connection object.
 * @param payer - The account paying for the transaction fees.
 * @param mint - The public key of the mint.
 * @returns The signature of the confirmed transaction, or an empty string if no fees are harvested.
 */
export async function harvestFees(
    connection: Connection,
    payer: Keypair,
    mint: PublicKey,
    accountsToHarvestFrom: PublicKey[]
): Promise<string> {
    if (accountsToHarvestFrom.length === 0) {
        console.log('No accounts provided to harvest from.');
        return '';
    }

    const harvestInstruction = createHarvestWithheldTokensToMintInstruction(
        mint,
        accountsToHarvestFrom,
        TOKEN_2022_PROGRAM_ID
    );
    
    const transaction = new Transaction().add(harvestInstruction);
    const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);

    console.log(`Successfully harvested fees.`);
    console.log(`   -> Transaction Signature: ${signature}`);

    return signature;
}
