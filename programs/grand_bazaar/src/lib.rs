mod instructions;
mod state;

use instructions::*;
use state::*;
use anchor_lang::prelude::*;
declare_id!("492EodhvjLq63FAsEKYtuULsKec1nmF2K526MBWrTBSz");

#[program]
pub mod lots_items_manager {
    use super::*;

    pub fn init_signer(ctx: Context<InitSigner>, game_id: u64) -> Result<()> {
        init_signer::handler(ctx, game_id).unwrap();
        Ok(())
    }

    pub fn mint_item_collection(ctx: Context<MintItemCollection>) -> Result<()> {
        mint_item_collection::handler(ctx).unwrap();
        Ok(())
    }

    pub fn mint_item_account(ctx: Context<MintItemAccount> ) -> Result<()> {
        mint_item_account::handler(ctx).unwrap();
        Ok(())
    }

    pub fn mint_to_item_account(ctx: Context<MintToItemAccount>) -> Result<()> {
        mint_to_item_account::handler(ctx).unwrap();
        Ok(())
    }

    pub fn transfer(ctx: Context<Transfer>) -> Result<()> {
        transfer::handler(ctx).unwrap(); 
        Ok(())
    }

    pub fn burn(ctx: Context<Burn>) -> Result<()> {
        burn::handler(ctx).unwrap();
        Ok(())
    }

    pub fn compress(ctx: Context<Compress>) -> Result<()> {
        compress::handler(ctx).unwrap();
        Ok(())
    }

    pub fn decompress(ctx: Context<Decompress>) -> Result<()> {
        decompress::handler(ctx).unwrap();
        Ok(())
    }

    pub fn transfer_and_decompress(ctx: Context<TransferAndDecompress>) -> Result<()> {
        transfer_and_decompress::handler(ctx).unwrap();
        Ok(())
    }

}

