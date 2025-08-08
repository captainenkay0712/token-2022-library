import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
const payer = Keypair.generate();

export { connection, payer };