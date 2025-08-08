# Solana Token-2022 Library

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

## Running Tests

To ensure the library is working correctly, you can run the test suite. Make sure you have a local Solana test validator running.

```bash
solana-test-validator
```

In a separate terminal, run the tests:

```bash
npm test
```
