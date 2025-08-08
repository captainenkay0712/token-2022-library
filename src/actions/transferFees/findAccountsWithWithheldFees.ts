import {
    Connection,
    PublicKey,
    AccountInfo,
} from '@solana/web3.js';
import {
    getTransferFeeAmount,
    unpackAccount,
    TOKEN_2022_PROGRAM_ID,
    ACCOUNT_SIZE,
} from '@solana/spl-token';

/**
 * Finds all token accounts for a given mint that have withheld transfer fees.
 *
 * @param connection - The Solana connection object.
 * @param mint - The public key of the mint.
 * @returns A promise that resolves to an array of public keys for the accounts with withheld fees.
 */
export async function findAccountsWithWithheldFees(
    connection: Connection,
    mint: PublicKey
): Promise<PublicKey[]> {
    // 1. Find all token accounts for the mint
    const allAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
        commitment: 'confirmed',
        filters: [
            {
                dataSize: ACCOUNT_SIZE,
            },
            {
                memcmp: {
                    offset: 0,
                    bytes: mint.toBase58(),
                },
            },
        ],
    });

    // 2. Find accounts with fees to harvest
    const accountsWithFees: PublicKey[] = [];
    for (const accountInfo of allAccounts) {
        const account = unpackAccount(accountInfo.pubkey, accountInfo.account, TOKEN_2022_PROGRAM_ID);
        const transferFeeAmount = getTransferFeeAmount(account);
        if (transferFeeAmount !== null && transferFeeAmount.withheldAmount > 0) {
            accountsWithFees.push(account.address);
        }
    }

    return accountsWithFees;
}
