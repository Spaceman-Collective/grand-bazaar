use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, MintTo, SetAuthority, TokenAccount},
};
use spl_token::instruction::AuthorityType;

use anchor_spl::metadata::{
    create_master_edition_v3, create_metadata_accounts_v3, CreateMasterEditionV3,
    CreateMetadataAccountsV3, Metadata,
};
use mpl_token_metadata::types::{Collection, Creator, DataV2};



use crate::*;


pub fn handler(
        ctx: Context<MintItemCollection>, 
        game_id: u64, 
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
    
    let bump = ctx.bumps.game_pda;
    let seeds = &[b"game".as_ref(), &game_id.to_le_bytes(), &[bump]];

    let signer = &[&seeds[..]];

    // Mint NFT
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.game_pda.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program.clone(), cpi_accounts, signer);
    token::mint_to(cpi_ctx, 1)?;

    create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                payer: ctx.accounts.payer.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                metadata: ctx.accounts.nft_metadata.to_account_info(),
                mint_authority: ctx.accounts.game_pda.to_account_info(),
                update_authority: ctx.accounts.game_pda.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            &[&seeds[..]],
        ),
        DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        true,
        false,
        None,
    )?;

    create_master_edition_v3(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
        CreateMasterEditionV3 {
                edition: ctx.accounts.master_edition_account.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                metadata: ctx.accounts.nft_metadata.to_account_info(),
                mint_authority: ctx.accounts.game_pda.to_account_info(),
                update_authority: ctx.accounts.game_pda.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            &[&seeds[..]],
        ),
        Some(1),
    )?;

    // // Freeze mint account
    // let cpi_accounts_set_authority = SetAuthority {
    //     account_or_mint: ctx.accounts.mint.to_account_info(),
    //     current_authority: ctx.accounts.game_pda.to_account_info(),
    // };
    // let cpi_ctx_set_authority = CpiContext::new_with_signer(cpi_program, cpi_accounts_set_authority, signer);
    // token::set_authority(
    //     cpi_ctx_set_authority,
    //     AuthorityType::MintTokens,
    //     None,
    // )?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct MintItemCollection<'info> {

     #[account(
        init,
        payer = payer,
        seeds = [b"mint", game_id.to_le_bytes().as_ref()],
        bump,
        mint::decimals = 0,
        mint::authority = game_pda,
        mint::freeze_authority = game_pda,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        seeds = [b"token", game_id.to_le_bytes().as_ref()],
        bump,
        payer = payer,
        token::mint = mint,
        token::authority = game_pda.to_account_info(),
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"game", game_id.to_le_bytes().as_ref()],
        bump
    )]
    pub game_pda: Account<'info, GamePda>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,

    #[account(
         mut,
         seeds = [
             b"metadata".as_ref(),
             metadata_program.key().as_ref(),
             mint.key().as_ref(),
             b"edition".as_ref(),
         ],
         bump,
         seeds::program = metadata_program.key()
       )]
    /// CHECK:
    pub master_edition_account: UncheckedAccount<'info>,
    #[account(
         mut,
         seeds = [
             b"metadata".as_ref(),
             metadata_program.key().as_ref(),
             mint.key().as_ref(),
         ],
         bump,
         seeds::program = metadata_program.key()
     )]
    /// CHECK:
    pub nft_metadata: UncheckedAccount<'info>,
}

