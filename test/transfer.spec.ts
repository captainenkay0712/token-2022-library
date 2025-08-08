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
//     transfer,
// } from '../src';
// import { getAccount, TOKEN_2022_PROGRAM_ID, getTransferFeeAmount } from '@solana/spl-token';

// describe('Token-2022 Library: transfer', () => {
//     let connection: Connection;
//     let payer: Keypair;
//     let mint: PublicKey;
//     let mintAuthority: Keypair;
//     let sourceOwner: Keypair;
//     let destinationOwner: Keypair;
//     let sourceAccount: PublicKey;
//     let destinationAccount: PublicKey;

//     const decimals = 9;
//     const feeBasisPoints = 100; // 1%
//     const maxFee = BigInt(5000 * 10 ** decimals); // A large max fee to not cap the fee in this test

//     before(async () => {
//         connection = new Connection('http://127.0.0.1:8899', 'confirmed');
//         payer = Keypair.generate();
//         mintAuthority = Keypair.generate();
//         sourceOwner = Keypair.generate();
//         destinationOwner = Keypair.generate();

//         // Airdrop SOL to payer
//         await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL)
//             .then(sig => connection.confirmTransaction(sig, 'confirmed'));

//         // Create a new mint with transfer fee
//         mint = await createMintWithTransferFee(
//             connection,
//             payer,
//             mintAuthority.publicKey,
//             null,
//             feeBasisPoints,
//             maxFee,
//             decimals
//         );

//         // Create source and destination accounts
//         sourceAccount = await createAssociatedTokenAccount(connection, payer, mint, sourceOwner.publicKey);
//         destinationAccount = await createAssociatedTokenAccount(connection, payer, mint, destinationOwner.publicKey);

//         // Mint initial tokens to the source account
//         const initialAmount = BigInt(1000 * 10 ** decimals);
//         await mintTo(connection, payer, mint, sourceAccount, mintAuthority, initialAmount);
//     });

//     it('should transfer tokens and correctly deduct the transfer fee', async () => {
//         const amountToTransfer = BigInt(100 * 10 ** decimals);
//         const expectedFee = (amountToTransfer * BigInt(feeBasisPoints)) / BigInt(10000);

//         // Get initial balances
//         const initialSourceInfo = await getAccount(connection, sourceAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
//         const initialDestinationInfo = await getAccount(connection, destinationAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);

//         // Perform the transfer
//         await transfer(
//             connection,
//             payer,
//             sourceAccount,
//             mint,
//             destinationAccount,
//             sourceOwner,
//             amountToTransfer,
//             decimals
//         );

//         // Verify final balances and withheld fee
//         const finalSourceInfo = await getAccount(connection, sourceAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
//         const finalDestinationInfo = await getAccount(connection, destinationAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);

//         // 1. Source account balance should be reduced by the transfer amount
//         const expectedSourceAmount = initialSourceInfo.amount - amountToTransfer;
//         expect(finalSourceInfo.amount).to.equal(expectedSourceAmount);

//         // 2. Destination account balance should be increased by the transfer amount minus the fee
//         const expectedDestinationAmount = initialDestinationInfo.amount + (amountToTransfer - expectedFee);
//         expect(finalDestinationInfo.amount).to.equal(expectedDestinationAmount);

//         // 3. The withheld fee should be recorded in the destination account
//         const feeInfo = getTransferFeeAmount(finalDestinationInfo);
//         expect(feeInfo).to.not.be.null;
//         if (feeInfo) {
//             expect(feeInfo.withheldAmount).to.equal(expectedFee);
//         }
//     });
// });
