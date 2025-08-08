# Solana Token-2022 Library

`token-2022-library` is a powerful TypeScript library designed to simplify interactions with Solana's Token-2022 program (also known as Token Extensions). It provides a set of high-level, easy-to-use utility functions (actions) for common operations like creating mints with extensions, minting tokens, transferring, and managing advanced features like Transfer Fees.

This library abstracts away the complexity of the Solana Web3.js and SPL Token libraries, allowing developers to integrate Token-2022 functionality into their applications quickly and efficiently.

## Installation

To use this library in your project, install it via npm:

```bash
npm install @solana/web3.js @solana/spl-token
# Add this library to your project (once published)
# npm install token-2022-library 
```

## Core Concepts

- **Connection**: A connection to the Solana JSON RPC endpoint.
- **Payer/Signer**: A `Keypair` object representing the account that pays for transaction fees and signs transactions.
- **Actions**: Asynchronous functions that perform a specific operation on the Solana blockchain (e.g., `createMint`, `transfer`).

---

## Usage Examples

Below are examples of how to use the core actions provided by the library.

### 1. Setting up the Connection and Payer

All actions require a `Connection` and a `payer` Keypair.

```typescript
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { requestAirdrop } from './src/actions/airdrop'; // Assuming local import

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const payer = Keypair.generate();

// Fund the payer account
await requestAirdrop(connection, payer.publicKey);
```

### 2. Creating a Mint with Extensions

Create a new token mint with the Transfer Fee extension.

```typescript
import { createMint, ExtensionType } from './src/actions/createMint';

const mintAuthority = Keypair.generate();
const transferFeeConfigAuthority = Keypair.generate();
const withdrawWithheldAuthority = Keypair.generate();

const extensions = [
    {
        extension: ExtensionType.TransferFeeConfig,
        feeBasisPoints: 100, // 1% fee
        maxFee: BigInt(5000), // Max fee of 5000 tokens
        transferFeeConfigAuthority: transferFeeConfigAuthority.publicKey,
        withdrawWithheldAuthority: withdrawWithheldAuthority.publicKey,
    },
];

const mintPublicKey = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    null, // No freeze authority
    9, // 9 decimals
    extensions
);

console.log(`New Mint Created: ${mintPublicKey}`);
```

### 3. Creating a Token Account

Create an associated token account (ATA) for a user.

```typescript
import { createAssociatedTokenAccount } from './src/actions/createAccount';

const owner = Keypair.generate();
const tokenAccountAddress = await createAssociatedTokenAccount(
    connection,
    payer,
    mintPublicKey,
    owner.publicKey
);

console.log(`New Token Account: ${tokenAccountAddress}`);
```

### 4. Minting Tokens

Mint new tokens to a specific token account.

```typescript
import { mintTo } from './src/actions/mintTo';

const amountToMint = BigInt(1_000_000_000); // 1,000 tokens with 9 decimals
await mintTo(
    connection,
    payer,
    mintPublicKey,
    tokenAccountAddress,
    mintAuthority, // The authority that can mint new tokens
    amountToMint
);
```

### 5. Transferring Tokens (with Transfer Fee)

Transfer tokens between two accounts. The Transfer Fee extension will automatically withhold fees.

```typescript
import { transfer } from './src/actions/transfer';

const destinationOwner = Keypair.generate();
const destinationAccount = await createAssociatedTokenAccount(connection, payer, mintPublicKey, destinationOwner.publicKey);

const amountToTransfer = BigInt(100_000_000); // 100 tokens

await transfer(
    connection,
    payer,
    tokenAccountAddress, // Source
    mintPublicKey,       // Mint of the token
    destinationAccount,  // Destination
    owner,               // Owner of the source account
    amountToTransfer,
    9 // Decimals
);
```

### 6. Managing Transfer Fees

#### Check Fee
Calculate the expected transfer fee for a given amount.

```typescript
import { checkFee } from './src/actions/transferFees/checkFee';

const fee = await checkFee(connection, mintPublicKey, amountToTransfer);
console.log(`Expected Fee: ${fee}`);
```

#### Find Accounts with Withheld Fees
Find all token accounts for a mint that have fees ready to be harvested.
**Note**: This function relies on `getProgramAccounts` and may be affected by RPC node indexing delays.

```typescript
import { findAccountsWithWithheldFees } from './src/actions/transferFees/findAccountsWithWithheldFees';

const accounts = await findAccountsWithWithheldFees(connection, mintPublicKey);
console.log('Accounts with fees:', accounts.map(a => a.toBase58()));
```

#### Harvest Fees
Collect all withheld fees from a list of token accounts and deposit them into the mint's fee vault.

```typescript
import { harvestFees } from './src/actions/transferFees/harvestFees';

// Harvest from the destination account from the previous transfer
await harvestFees(connection, payer, mintPublicKey, [destinationAccount]);
console.log('Fees harvested!');
```

### 7. Closing a Mint

If a `closeAuthority` was set during mint creation, you can close the mint account and reclaim its lamports.

```typescript
import { closeMint } from './src/actions/mintClose/closeMint';

// First, create a mint with a close authority
const closeAuthority = Keypair.generate();
const mintWithCloseAuth = await createMint(connection, payer, mintAuthority.publicKey, closeAuthority.publicKey, 9, []);

// Later, close it
await closeMint(
    connection,
    payer,
    mintWithCloseAuth,
    closeAuthority, // The authority that can close the mint
    payer.publicKey // Account to receive the reclaimed lamports
);
```


## Description

The Token-2022 Library is a powerful, lightweight TypeScript toolkit designed to simplify interactions with Solana's Token-2022 program. It provides developers with a set of easy-to-use, reusable functions for creating and managing tokens with modern extensions like Transfer Fees. Whether you're building a DeFi protocol, an NFT marketplace, or any application on Solana, this library abstracts away the low-level complexity, allowing you to integrate advanced token features quickly and efficiently.

## Features

-   **Generic Mint Creation**: Create SPL tokens with any combination of Token-2022 extensions.
-   **Transfer Fee Support**: Built-in, first-class support for creating tokens with the `TransferFee` extension.
-   **Simplified Actions**: Easy-to-use functions for common operations like `createAssociatedTokenAccount`, `mintTo`, and `transfer`.
-   **Type-Safe**: Written in TypeScript to ensure type safety and improve developer experience.
-   **Lightweight**: Minimal dependencies, focused purely on Token-2022 interactions.

## Installation

```bash
npm install
```

## Getting Started

Here are some common examples of how to use the library.

### 1. Setup Connection and Payer

First, set up your connection to the Solana cluster and create a payer keypair. You'll need to airdrop some SOL to the payer account to cover transaction fees.

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { requestAirdrop } from './src'; // Assuming you are in the project root

async function setup() {
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
    const payer = Keypair.generate();
    await requestAirdrop(connection, payer.publicKey);
    return { connection, payer };
}
```

### 2. Create a Mint with a Transfer Fee

Use the generic `createMint` function to create a new token mint with the `TransferFeeConfig` extension.

```typescript
import { createMint } from './src';
import { ExtensionType } from '@solana/spl-token';
import { Keypair } from '@solana/web3.js';

async function createFeeToken(connection, payer) {
    const mintAuthority = Keypair.generate();
    const freezeAuthority = null;
    const decimals = 9;

    const extensions = [
        {
            extension: ExtensionType.TransferFeeConfig,
            feeBasisPoints: 100, // 1%
            maximumFee: BigInt(5000), // 5000 lamports
        },
    ] as const;

    const mint = await createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        freezeAuthority,
        decimals,
        extensions
    );

    console.log('New Mint with Transfer Fee:', mint.toBase58());
    return { mint, mintAuthority };
}
```

### 3. Create a Token Account

Create an Associated Token Account (ATA) for a specific user (owner) to hold the tokens.

```typescript
import { createAssociatedTokenAccount } from './src';

async function createTokenAccount(connection, payer, mint, owner) {
    const tokenAccount = await createAssociatedTokenAccount(
        connection,
        payer,
        mint,
        owner.publicKey
    );

    console.log('New Token Account:', tokenAccount.toBase58());
    return tokenAccount;
}
```

### 4. Mint Tokens

Mint a specified amount of tokens to a destination token account.

```typescript
import { mintTo } from './src';

async function mintTokens(connection, payer, mint, destination, mintAuthority, amount) {
    await mintTo(
        connection,
        payer,
        mint,
        destination,
        mintAuthority,
        amount
    );

    console.log(`Minted ${amount} tokens to ${destination.toBase58()}`);
}
```

### 5. Transfer Tokens with Fee

The `transfer` function automatically handles the logic for the `TransferFee` extension. The fee is withheld from the amount received by the destination account.

```typescript
import { transfer } from './src';

async function transferTokens(connection, payer, sourceAccount, mint, destinationAccount, sourceOwner, amount, decimals) {
    await transfer(
        connection,
        payer,
        sourceAccount,
        mint,
        destinationAccount,
        sourceOwner,
        amount,
        decimals
    );

    console.log(`Transferred ${amount} tokens.`);
}
```

### Creating a Mint with Close Authority and Closing It

This example shows how to create a new mint that can be closed by a designated authority, and then how to execute that action.

```typescript
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    createMint,
    closeMint,
    requestAirdrop,
    ExtensionType,
} from 'token-2022-library';

// Setup
const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
const payer = Keypair.generate();
const mintAuthority = Keypair.generate();
const closeAuthority = Keypair.generate();

// 1. Airdrop SOL to the payer
await requestAirdrop(connection, payer.publicKey);

// 2. Create a mint with the MintCloseAuthority extension
const mintWithClose = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    null, // No freeze authority
    9,    // Decimals
    [
        {
            extension: ExtensionType.MintCloseAuthority,
            closeAuthority: closeAuthority.publicKey,
        },
    ]
);

console.log(`Created mint with close authority: ${mintWithClose.toBase58()}`);

// 3. Close the mint using the designated authority
await closeMint(
    connection,
    payer,          // Account to pay for the transaction
    mintWithClose,  // The mint to close
    closeAuthority, // The authority keypair
    payer.publicKey // Account to receive the reclaimed SOL
);

console.log('Mint successfully closed.');
```

## Running Tests

To ensure the library is working correctly, you can run the test suite. Make sure you have a local Solana test validator running.

```bash
solana-test-validator
```

In a separate terminal, run the tests:

```bash
npm test
```
