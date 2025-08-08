
import { expect } from 'chai';
import { Keypair } from '@solana/web3.js';
import { createMint, requestAirdrop } from '../src';
import {
    unpackMint,
    getTransferFeeConfig,
    getMintCloseAuthority,
    ExtensionType,
} from '@solana/spl-token';

import {connection, payer} from './config/env';

describe('Token-2022 Library: createMint', () => {
    before(async () => {
        await requestAirdrop(connection, payer.publicKey);
    });

    it('should create a new mint with multiple extensions', async () => {
        const mintAuthority = Keypair.generate();
        const closeAuthority = Keypair.generate();
        const feeBasisPoints = 100; // 1%
        const maxFee = BigInt(5000); // 5000 lamports

        const extensions = [
            {
                extension: ExtensionType.MintCloseAuthority,
                closeAuthority: closeAuthority.publicKey,
            },
            {
                extension: ExtensionType.TransferFeeConfig,
                transferFeeConfigAuthority: null,
                withdrawWithheldAuthority: null,
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

        // Check Mint Close Authority config
        const mintCloseAuthority = getMintCloseAuthority(mintData);
        expect(mintCloseAuthority).to.not.be.null;
        if (mintCloseAuthority) {
            expect(mintCloseAuthority.closeAuthority.toBase58()).to.equal(closeAuthority.publicKey.toBase58());
        }

        // Check Transfer Fee config
        const transferFeeConfig = getTransferFeeConfig(mintData);
        expect(transferFeeConfig).to.not.be.null;
        if (transferFeeConfig) {
            expect(transferFeeConfig.newerTransferFee.transferFeeBasisPoints).to.equal(feeBasisPoints);
            expect(transferFeeConfig.newerTransferFee.maximumFee).to.equal(maxFee);
        }
    });
});
