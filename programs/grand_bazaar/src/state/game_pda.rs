use anchor_lang::prelude::*;

use crate::MaxSize;

#[account]
pub struct GamePDA {
    pub game_id: u64,
    pub authority: Pubkey,
}

impl MaxSize for GamePDA {
    fn get_max_size() -> usize {
        return 8 + 32;
    }
}
