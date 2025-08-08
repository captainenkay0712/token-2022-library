//! Token 2022 Transfer Fee Extension helpers

use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
};

/// Withdraw withheld tokens from accounts (Transfer Fee extension)
pub fn withdraw_withheld_tokens_from_accounts(
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // TODO: Implement invoke_signed for transfer_fee extension
    Ok(())
}
