import { expect } from 'chai';
import { Keypair, PublicKey } from '@solana/web3.js';
import { ExtensionType } from '@solana/spl-token';
import { connection, payer } from './config/env';
import { createMint } from '../src/actions/createMint';
import { closeMint } from '../src/actions/mintClose/closeMint';
import { requestAirdrop } from '../src/actions/airdrop';

describe('Token-2022 Library: closeMint', () => {
    let closeAuthority: Keypair;
    let mintPublicKey: PublicKey;

    before(async () => {
        await requestAirdrop(connection, payer.publicKey);

        closeAuthority = Keypair.generate();
        const mintAuthority = Keypair.generate();

        const extensions = [
            {
                extension: ExtensionType.MintCloseAuthority,
                closeAuthority: closeAuthority.publicKey,
            },
        ] as const;

        mintPublicKey = await createMint(
            connection,
            payer,
            mintAuthority.publicKey,
            null,
            9,
            extensions
        );
    });

    it('should close the mint account', async () => {
        await closeMint(
            connection,
            payer,
            mintPublicKey,
            closeAuthority,
            payer.publicKey // Destination for lamports
        );

        const mintInfo = await connection.getAccountInfo(mintPublicKey);
        expect(mintInfo).to.be.null;
    });
});
