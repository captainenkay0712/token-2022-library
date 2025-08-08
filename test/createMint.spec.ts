
import { expect } from 'chai';
import { Keypair } from '@solana/web3.js';
import { createMint, requestAirdrop } from '../src';
import {
    unpackMint,
    getTransferFeeConfig,
    ExtensionType,
} from '@solana/spl-token';

import {connection, payer} from './config/env';

describe('Token-2022 Library: createMint', () => {
    before(async () => {
        await requestAirdrop(connection, payer.publicKey);
    });

    it('should create a new mint with transfer fee', async () => {
        const mintAuthority = Keypair.generate();
        const feeBasisPoints = 100; // 1%
        const maxFee = BigInt(5000); // 5000 lamports

        const extensions = [
            {
                extension: ExtensionType.TransferFeeConfig,
                feeBasisPoints: feeBasisPoints,
                maximumFee: maxFee,
            },
        ] as const;

        const mintPublicKey = await createMint(
            connection,
            payer,
            mintAuthority.publicKey,
            null, // freezeAuthority
            9, // decimals
            extensions
        );

        expect(mintPublicKey).to.not.be.null;

        // Verify the created mint
        const mintInfo = await connection.getAccountInfo(mintPublicKey);
        if (!mintInfo) {
            throw new Error('Mint account not found. Test failed.');
        }

        const mintData = unpackMint(mintPublicKey, mintInfo, mintInfo.owner);
        const transferFeeConfig = getTransferFeeConfig(mintData);

        expect(transferFeeConfig).to.not.be.null;

        // Check the fee config details
        if (transferFeeConfig) {
            expect(transferFeeConfig.newerTransferFee.transferFeeBasisPoints).to.equal(feeBasisPoints);
            expect(transferFeeConfig.newerTransferFee.maximumFee).to.equal(maxFee);
            expect(transferFeeConfig.olderTransferFee.transferFeeBasisPoints).to.equal(feeBasisPoints);
            expect(transferFeeConfig.olderTransferFee.maximumFee).to.equal(maxFee);
        }
    });
});
