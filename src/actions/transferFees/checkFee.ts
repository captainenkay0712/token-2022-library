import {
    Connection,
    PublicKey,
} from '@solana/web3.js';
import {
    getMint,
    getTransferFeeConfig,
    calculateFee,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

/**
 * Calculates the transfer fee for a given amount and mint.
 *
 * @param connection - The Solana connection object.
 * @param mint - The public key of the mint.
 * @param amount - The amount of tokens to be transferred.
 * @returns The calculated fee in token units.
 */
export async function checkFee(
    connection: Connection,
    mint: PublicKey,
    amount: bigint
): Promise<bigint> {
    const mintInfo = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);

    const transferFeeConfig = getTransferFeeConfig(mintInfo);
    if (!transferFeeConfig) {
        throw new Error('The mint does not have a transfer fee configuration.');
    }

    const fee = calculateFee(transferFeeConfig.newerTransferFee, amount);

    return fee;
}
