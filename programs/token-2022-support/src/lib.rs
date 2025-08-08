//! Token 2022 On-chain Support Library
//!
//! This library provides helper functions for interacting with SPL Token 2022 and its extensions (transfer fee, metadata, etc.),
//! so on-chain protocols can easily copy-paste into their contracts.

pub mod transfer_fee;
pub mod metadata;
// Add other extensions here

// Core SPL Token 2022 functions (mint, transfer, burn, ...)
pub mod core;
