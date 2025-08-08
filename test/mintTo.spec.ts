// import {
//     Connection,
//     Keypair,
//     LAMPORTS_PER_SOL,
//     PublicKey,
// } from '@solana/web3.js';
// import { expect } from 'chai';
// import {
//     createMintWithTransferFee,
//     createAssociatedTokenAccount,
//     mintTo,
// } from '../src';
// import { getAccount, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

// describe('Token-2022 Library: mintTo', () => {
//     let connection: Connection;
//     let payer: Keypair;
//     let mint: PublicKey;
//     let mintAuthority: Keypair;
//     let destinationAccount: PublicKey;

//     before(async () => {
//         connection = new Connection('http://127.0.0.1:8899', 'confirmed');
//         payer = Keypair.generate();
//         mintAuthority = Keypair.generate();
//         const owner = Keypair.generate();

//         // Airdrop SOL to payer
//         const airdropSignature = await connection.requestAirdrop(
//             payer.publicKey,
//             2 * LAMPORTS_PER_SOL
//         );
//         await connection.confirmTransaction(airdropSignature, 'confirmed');

//         // Create a new mint
//         mint = await createMintWithTransferFee(
//             connection,
//             payer,
//             mintAuthority.publicKey,
//             null, // freezeAuthority
//             0,    // No fee for this test
//             BigInt(0),
//             9
//         );

//         // Create a destination account
//         destinationAccount = await createAssociatedTokenAccount(
//             connection,
//             payer,
//             mint,
//             owner.publicKey
//         );
//     });

//     it('should mint tokens to the destination account', async () => {
//         const amountToMint = BigInt(100 * 10 ** 9); // 100 tokens with 9 decimals

//         await mintTo(
//             connection,
//             payer,
//             mint,
//             destinationAccount,
//             mintAuthority,
//             amountToMint
//         );

//         // Verify the account balance
//         const accountInfo = await getAccount(connection, destinationAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
//         expect(accountInfo.amount).to.equal(amountToMint);
//     });
// });
