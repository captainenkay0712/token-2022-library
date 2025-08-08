import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    TransactionInstruction,
} from '@solana/web3.js';
import {
    createInitializeMintInstruction,
    getMintLen,
    ExtensionType,
    createInitializeTransferFeeConfigInstruction,
    createInitializeMintCloseAuthorityInstruction,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

// Define a type for the Mint Close Authority extension configuration
export interface MintCloseAuthorityConfig {
    extension: ExtensionType.MintCloseAuthority;
    closeAuthority: PublicKey;
}

// Define a type for the Transfer Fee extension configuration
export interface TransferFeeConfig {
    extension: ExtensionType.TransferFeeConfig;
    transferFeeConfigAuthority: PublicKey | null;
    withdrawWithheldAuthority: PublicKey | null;
    feeBasisPoints: number;
    maximumFee: bigint;
}

// A generic type for any extension configuration
export type ExtensionConfig = TransferFeeConfig | MintCloseAuthorityConfig;

/**
 * Creates a new mint with specified extensions.
 *
 * @param connection - The connection to the Solana cluster.
 * @param payer - The keypair of the account that will pay for the transaction.
 * @param mintAuthority - The public key of the mint authority.
 * @param freezeAuthority - The public key of the freeze authority (optional).
 * @param decimals - The number of decimal places for the token.
 * @param extensions - An array of extension configuration objects.
 * @param mintKeypair - The keypair for the new mint account (optional).
 * @returns The public key of the newly created mint.
 */
export async function createMint(
    connection: Connection,
    payer: Keypair,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey | null,
    decimals: number,
    extensions: readonly ExtensionConfig[],
    mintKeypair = Keypair.generate()
): Promise<PublicKey> {
    const extensionTypes = extensions.map((e) => e.extension);
    const mintLen = getMintLen(extensionTypes);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const instructions: TransactionInstruction[] = [];

    // Create account instruction
    instructions.push(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        })
    );

    // Add instructions for each extension
    for (const ext of extensions) {
        switch (ext.extension) {
            case ExtensionType.MintCloseAuthority:
                const mintCloseAuthorityConfig = ext as MintCloseAuthorityConfig;
                instructions.push(
                    createInitializeMintCloseAuthorityInstruction(
                        mintKeypair.publicKey,
                        mintCloseAuthorityConfig.closeAuthority,
                        TOKEN_2022_PROGRAM_ID
                    )
                );
                break;
            case ExtensionType.TransferFeeConfig:
                instructions.push(
                    createInitializeTransferFeeConfigInstruction(
                        mintKeypair.publicKey,
                        ext.transferFeeConfigAuthority,
                        ext.withdrawWithheldAuthority,
                        ext.feeBasisPoints,
                        ext.maximumFee,
                        TOKEN_2022_PROGRAM_ID
                    )
                );
                break;
            // Add cases for other extensions here
        }
    }

    // Initialize mint instruction
    instructions.push(
        createInitializeMintInstruction(
            mintKeypair.publicKey,
            decimals,
            mintAuthority,
            freezeAuthority,
            TOKEN_2022_PROGRAM_ID
        )
    );

    const transaction = new Transaction().add(...instructions);

    const signature = await sendAndConfirmTransaction(connection, transaction, [
        payer,
        mintKeypair,
    ]);

    console.log('Successfully created a new mint.');
    console.log('   -> Mint Address:', mintKeypair.publicKey.toBase58());
    console.log('   -> Transaction Signature:', signature);

    return mintKeypair.publicKey;
}

/**
 * (DEPRECATED) Creates a new mint with the Transfer Fee extension.
 * Use `createMint` instead for more flexibility.
 */
export async function createMintWithTransferFee(
    connection: Connection,
    payer: Keypair,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey | null,
    feeBasisPoints: number,
    maxFee: bigint,
    decimals: number
): Promise<PublicKey> {
    return createMint(connection, payer, mintAuthority, freezeAuthority, decimals, [
        {
            extension: ExtensionType.TransferFeeConfig,
            transferFeeConfigAuthority: null,
            withdrawWithheldAuthority: null,
            feeBasisPoints,
            maximumFee: maxFee,
        },
    ]);
}
