//! Core SPL Token 2022 functions (mint, transfer, burn, ...)

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::{invoke_signed},
    pubkey::Pubkey,
};

// Mint tokens
doc_comment! {
    "Mint new tokens to a destination account.",
    pub fn mint_to(
        accounts: &[AccountInfo],
        amount: u64,
        mint_pubkey: &Pubkey,
        authority_seeds: &[&[u8]],
    ) -> ProgramResult {
        // TODO: Implement invoke_signed to call SPL Token 2022 mint_to instruction
        Ok(())
    }
}

// Transfer tokens
doc_comment! {
    "Transfer tokens from source to destination.",
    pub fn transfer(
        accounts: &[AccountInfo],
        amount: u64,
        authority_seeds: &[&[u8]],
    ) -> ProgramResult {
        // TODO: Implement invoke_signed to call SPL Token 2022 transfer instruction
        Ok(())
    }
}
