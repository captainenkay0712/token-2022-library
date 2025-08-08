// import {
//     Connection,
//     Keypair,
//     LAMPORTS_PER_SOL,
//     PublicKey,
// } from '@solana/web3.js';
// import { expect } from 'chai';
// import { createMintWithTransferFee, createAssociatedTokenAccount } from '../src';
// import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

// describe('Token-2022 Library: createAccount', () => {
//     let connection: Connection;
//     let payer: Keypair;
//     let mint: PublicKey;
//     let owner: Keypair;

//     before(async () => {
//         connection = new Connection('http://127.0.0.1:8899', 'confirmed');
//         payer = Keypair.generate();
//         owner = Keypair.generate();

//         // Airdrop SOL to payer
//         const airdropSignature = await connection.requestAirdrop(
//             payer.publicKey,
//             2 * LAMPORTS_PER_SOL
//         );
//         await connection.confirmTransaction(airdropSignature, 'confirmed');

//         // Create a new mint to be used for account creation
//         const mintAuthority = Keypair.generate();
//         mint = await createMintWithTransferFee(
//             connection,
//             payer,
//             mintAuthority.publicKey,
//             null,
//             100, // 1% fee
//             BigInt(5000), // Max 5000 lamports fee
//             9
//         );
//     });

//     it('should create a new associated token account', async () => {
//         const associatedTokenAccount = await createAssociatedTokenAccount(
//             connection,
//             payer,
//             mint,
//             owner.publicKey
//         );

//         expect(associatedTokenAccount).to.not.be.null;

//         // Verify the created account
//         const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
//         if (!accountInfo) {
//             throw new Error('Associated Token Account not found. Test failed.');
//         }

//         expect(accountInfo.owner.toBase58()).to.equal(TOKEN_2022_PROGRAM_ID.toBase58());
//     });
// });
