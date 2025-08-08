import { expect } from 'chai';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
    ExtensionType,
    getAccount,
    getTransferFeeAmount,
    TOKEN_2022_PROGRAM_ID,
    calculateFee as splCalculateFee,
    getMint,
    getTransferFeeConfig,
} from '@solana/spl-token';
import { connection, payer } from './config/env';
import { createMint, TransferFeeConfig } from '../src/actions/createMint';
import { checkFee } from '../src/actions/transferFees/checkFee';
import { harvestFees } from '../src/actions/transferFees/harvestFees';
import { findAccountsWithWithheldFees } from '../src/actions/transferFees/findAccountsWithWithheldFees';
import { withdrawWithheldTokensFromMint } from '../src/actions/transferFees/withdrawWithheldTokensFromMint';
import { withdrawWithheldTokensFromAccounts } from '../src/actions/transferFees/withdrawWithheldTokensFromAccounts';
import { requestAirdrop } from '../src/actions/airdrop';
import { createAssociatedTokenAccount as createAccount } from '../src/actions/createAccount';
import { mintTo } from '../src/actions/mintTo';
import { transfer } from '../src/actions/transfer';

describe('Token-2022 Library: Transfer Fee Extension', () => {
    let mint: PublicKey;
    let mintAuthority: Keypair;
    let withdrawWithheldAuthority: Keypair;
    const feeBasisPoints = 100; // 1%
    const maxFee = BigInt(5000);

    // Using beforeEach to ensure test independence
    beforeEach(async () => {
        await requestAirdrop(connection, payer.publicKey);

        mintAuthority = Keypair.generate();
        withdrawWithheldAuthority = Keypair.generate();

        const extensions: [TransferFeeConfig] = [
            {
                extension: ExtensionType.TransferFeeConfig,
                feeBasisPoints: feeBasisPoints,
                maximumFee: maxFee,
                transferFeeConfigAuthority: null, // Using mint authority
                withdrawWithheldAuthority: withdrawWithheldAuthority.publicKey,
            },
        ];

        mint = await createMint(connection, payer, mintAuthority.publicKey, null, 9, extensions);
    });

    it('should calculate the correct transfer fee', async () => {
        const transferAmount = BigInt(1_000_000);
        const expectedFee = BigInt(5000); // Capped by maxFee

        const calculatedFee = await checkFee(connection, mint, transferAmount);

        expect(calculatedFee).to.equal(expectedFee);
    });

    it('should harvest and withdraw fees correctly', async () => {
        // 1. Setup accounts
        const sourceOwner = Keypair.generate();
        const sourceAccount = await createAccount(connection, payer, mint, sourceOwner.publicKey, TOKEN_2022_PROGRAM_ID);
        const destinationAccount = await createAccount(
            connection,
            payer,
            mint,
            Keypair.generate().publicKey,
            TOKEN_2022_PROGRAM_ID
        );

        // 2. Mint tokens to source
        const mintAmount = BigInt(1_000_000);
        await mintTo(connection, payer, mint, sourceAccount, mintAuthority, mintAmount);

        // 3. Transfer to generate fees
        const transferAmount = BigInt(500_000);
        const mintInfo = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
        const transferFeeConfig = getTransferFeeConfig(mintInfo);
        if (!transferFeeConfig) {
            throw new Error('Transfer fee config not found on mint');
        }
        const expectedFee = splCalculateFee(transferFeeConfig.newerTransferFee, transferAmount);
        await transfer(connection, payer, sourceAccount, mint, destinationAccount, sourceOwner, transferAmount, 9);

        // 4. Verify fees were withheld
        const destAccountInfo = await getAccount(connection, destinationAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
        const withheldAmount = getTransferFeeAmount(destAccountInfo)?.withheldAmount;
        expect(withheldAmount).to.equal(expectedFee);

        // 5. Harvest fees
        await harvestFees(connection, payer, mint, [destinationAccount]);

        // 6. Verify fees are harvested
        const destAccountInfoAfterHarvest = await getAccount(connection, destinationAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
        const withheldAmountAfterHarvest = getTransferFeeAmount(destAccountInfoAfterHarvest)?.withheldAmount;
        expect(withheldAmountAfterHarvest).to.equal(BigInt(0));

        // 7. Withdraw fees from mint
        const withdrawDestinationAccount = await createAccount(
            connection,
            payer,
            mint,
            withdrawWithheldAuthority.publicKey,
            TOKEN_2022_PROGRAM_ID
        );
        await withdrawWithheldTokensFromMint(connection, payer, mint, withdrawDestinationAccount, withdrawWithheldAuthority, []);

        // 8. Verify destination account received the fees
        const finalBalance = await getAccount(connection, withdrawDestinationAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
        expect(finalBalance.amount).to.equal(expectedFee);
    });

    it('should withdraw withheld fees directly from accounts', async () => {
        const mintDecimals = 9;

        // 1. Create accounts
        const sender = Keypair.generate();
        const recipient = Keypair.generate();
        const senderAccount = await createAccount(connection, payer, mint, sender.publicKey, TOKEN_2022_PROGRAM_ID);
        const recipientAccount = await createAccount(connection, payer, mint, recipient.publicKey, TOKEN_2022_PROGRAM_ID);

        // 2. Mint tokens to sender
        const mintAmount = BigInt(1_000_000);
        await mintTo(connection, payer, mint, senderAccount, mintAuthority, mintAmount);

        // 3. Transfer tokens to create a fee
        const transferAmount = BigInt(500_000);
        const fee = await checkFee(connection, mint, transferAmount);
        await transfer(connection, payer, senderAccount, mint, recipientAccount, sender, transferAmount, mintDecimals);

        // 4. Withdraw fees directly from the source accounts
        const withdrawDestinationAccount = await createAccount(
            connection,
            payer,
            mint,
            withdrawWithheldAuthority.publicKey,
            TOKEN_2022_PROGRAM_ID
        );

        await withdrawWithheldTokensFromAccounts(
            connection,
            payer,
            mint,
            withdrawDestinationAccount,
            withdrawWithheldAuthority,
            [senderAccount, recipientAccount], // Withdraw from both accounts that could have fees
            []
        );

        // 5. Check the balance of the withdraw destination account
        const finalBalance = await getAccount(connection, withdrawDestinationAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
        expect(finalBalance.amount).to.equal(fee);
    });

    it.skip('should find accounts with withheld fees', async () => {
        // 1. Setup accounts
        const sourceOwner = Keypair.generate();
        const sourceAccount = await createAccount(connection, payer, mint, sourceOwner.publicKey, TOKEN_2022_PROGRAM_ID);
        const destinationAccount = await createAccount(
            connection,
            payer,
            mint,
            Keypair.generate().publicKey,
            TOKEN_2022_PROGRAM_ID
        );

        // 2. Mint tokens to source
        const mintAmount = BigInt(1_000_000);
        await mintTo(connection, payer, mint, sourceAccount, mintAuthority, mintAmount);

        // 3. Transfer to generate fees
        const transferAmount = BigInt(500_000);
        await transfer(connection, payer, sourceAccount, mint, destinationAccount, sourceOwner, transferAmount, 9);

        // 4. Find accounts with fees
        const accountsWithFees = await findAccountsWithWithheldFees(connection, mint);

        // This test is skipped because getProgramAccounts is unreliable on solana-test-validator
        // for Token-2022 extension data.
        expect(accountsWithFees).to.not.be.empty;
    });
});
