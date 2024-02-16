use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use mpl_token_metadata::{
    instructions::{
        CreateMasterEditionV3CpiAccounts, CreateMasterEditionV3InstructionArgs, MintV1Cpi,
        MintV1CpiAccounts, MintV1InstructionArgs,
    },
    types::DataV2,
    ID as MPL_TOKEN_METADATA_ID,
};

use crate::*;

use mpl_token_metadata::instructions::{
    CreateMasterEditionV3Cpi, CreateMetadataAccountV3Cpi, CreateMetadataAccountV3CpiAccounts,
    CreateMetadataAccountV3InstructionArgs,
};

pub fn handler(ctx: Context<InitGame>, metadata: GameMetadata) -> Result<()> {
    // Create game pda and signer
    let game = &mut ctx.accounts.game;
    game.game_id = metadata.game_id;
    game.authority = ctx.accounts.signer.key();

    let gid = metadata.game_id.to_le_bytes();
    // Create game collection metadata
    let game_setting_seeds: &[&[u8]] = &[gid.as_ref(), &[ctx.bumps.game]];
    let signer_seeds = &[game_setting_seeds];

    // Create Metadata
    CreateMetadataAccountV3Cpi::new(
        &ctx.accounts.mpl_program.to_account_info(),
        CreateMetadataAccountV3CpiAccounts {
            payer: &ctx.accounts.signer.to_account_info(),
            metadata: &ctx.accounts.metadata_account.to_account_info(),
            mint: &ctx.accounts.mint.to_account_info(),
            mint_authority: &ctx.accounts.game.to_account_info(),
            update_authority: (&ctx.accounts.game.to_account_info(), false),
            system_program: &ctx.accounts.system_program.to_account_info(),
            rent: Some(&ctx.accounts.rent_account.to_account_info()),
        },
        CreateMetadataAccountV3InstructionArgs {
            data: DataV2 {
                name: metadata.name,
                symbol: metadata.symbol,
                seller_fee_basis_points: 0,
                creators: None,
                uri: metadata.uri,
                collection: None,
                uses: None,
            },
            is_mutable: false,
            collection_details: None,
        },
    )
    .invoke_signed(signer_seeds)?;
    // Create Master Edition
    CreateMasterEditionV3Cpi::new(
        &ctx.accounts.mpl_program.to_account_info(),
        CreateMasterEditionV3CpiAccounts {
            edition: &ctx.accounts.master_edition_account.to_account_info(),
            mint: &ctx.accounts.mint.to_account_info(),
            update_authority: &ctx.accounts.game.to_account_info(),
            mint_authority: &ctx.accounts.game.to_account_info(),
            payer: &ctx.accounts.signer.to_account_info(),
            metadata: &ctx.accounts.metadata_account.to_account_info(),
            token_program: &ctx.accounts.token_program.to_account_info(),
            system_program: &ctx.accounts.system_program.to_account_info(),
            rent: Some(&ctx.accounts.rent_account.to_account_info()),
        },
        CreateMasterEditionV3InstructionArgs { max_supply: None },
    )
    .invoke_signed(signer_seeds)?;

    MintV1Cpi::new(
        &ctx.accounts.mpl_program.to_account_info(),
        MintV1CpiAccounts {
            token: &ctx.accounts.token.to_account_info(),
            token_owner: Some(&ctx.accounts.game.to_account_info()),
            metadata: &ctx.accounts.metadata_account.to_account_info(),
            master_edition: Some(&ctx.accounts.master_edition_account.to_account_info()),
            token_record: None,
            mint: &ctx.accounts.mint.to_account_info(),
            authority: &ctx.accounts.game.to_account_info(),
            delegate_record: None,
            payer: &ctx.accounts.signer.to_account_info(),
            system_program: &ctx.accounts.system_program.to_account_info(),
            sysvar_instructions: &ctx.accounts.sysvar_instructions.to_account_info(),
            spl_token_program: &ctx.accounts.token_program.to_account_info(),
            spl_ata_program: &ctx.accounts.ata_program.to_account_info(),
            authorization_rules: None,
            authorization_rules_program: None,
        },
        MintV1InstructionArgs {
            amount: 1,
            authorization_data: None,
        },
    )
    .invoke_signed(signer_seeds)?;

    // Mint Token
    /*
    // Creates metadata, master edition
    CreateV1CpiBuilder::new(&ctx.accounts.mpl_program.to_account_info())
        .metadata(&ctx.accounts.metadata_account.to_account_info())
        .mint(&ctx.accounts.mint.to_account_info(), false)
        .authority(&ctx.accounts.game.to_account_info())
        .payer(&ctx.accounts.signer.to_account_info())
        .update_authority(&ctx.accounts.game.to_account_info(), true)
        .master_edition(Some(&ctx.accounts.master_edition_account.to_account_info()))
        .system_program(&ctx.accounts.system_program)
        .sysvar_instructions(&ctx.accounts.sysvar_account.to_account_info())
        .spl_token_program(Some(&ctx.accounts.token_program.to_account_info()))
        .token_standard(TokenStandard::NonFungible)
        .uri(metadata.uri)
        .name(metadata.name)
        .seller_fee_basis_points(0)
        .print_supply(PrintSupply::Zero)
        .invoke_signed(signer_seeds)?;

    // Mints the NFT to the Game PDA
    MintV1CpiBuilder::new(&ctx.accounts.mpl_program.to_account_info())
        .token(&ctx.accounts.token.to_account_info())
        .token_owner(Some(&ctx.accounts.game.to_account_info()))
        .metadata(&ctx.accounts.metadata_account.to_account_info())
        .master_edition(Some(&ctx.accounts.master_edition_account.to_account_info()))
        .mint(&ctx.accounts.mint.to_account_info())
        .payer(&ctx.accounts.signer)
        .authority(&ctx.accounts.game.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .sysvar_instructions(&ctx.accounts.sysvar_account.to_account_info())
        .spl_token_program(&ctx.accounts.token_program.to_account_info())
        .spl_ata_program(&ctx.accounts.ata_program.to_account_info())
        .amount(1)
        .invoke_signed(signer_seeds)?;
     */
    Ok(())
}

#[derive(Accounts)]
#[instruction(metadata:GameMetadata)]
pub struct InitGame<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,

    #[account(
        init,
        payer = signer,
        space = 8 + GamePDA::get_max_size(),
        seeds = [b"game".as_ref(), metadata.game_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub game: Account<'info, GamePDA>,

    // SPL Mint - Random Keypair generation
    #[account(
        init,
        payer=signer,
        mint::decimals = 0,
        mint::authority = game,
        mint::freeze_authority = game
    )]
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,

    // Metadata
    /// CHECK: Metadata program will create it
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: This is a program. and we check it. gud comment
    #[account(address = MPL_TOKEN_METADATA_ID)]

    /// CHECK: This is a program. and we check it. gud comment
    pub mpl_program: AccountInfo<'info>,
    pub rent_account: Sysvar<'info, Rent>,
    /// CHECK: sysvar
    pub sysvar_instructions: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            b"metadata".as_ref(),
            mpl_program.key().as_ref(),
            mint.key().as_ref(),
            b"edition".as_ref(),
        ],
        bump,
        seeds::program = mpl_program.key()
      )]
    /// CHECK: IDK man this is some metaplex shit
    pub master_edition_account: UncheckedAccount<'info>,

    // Minting NFT
    #[account(
        init,
        seeds = [b"token", metadata.game_id.to_le_bytes().as_ref()],
        bump,
        payer = signer,
        token::mint = mint,
        token::authority = game.to_account_info(),
    )]
    pub token: Account<'info, TokenAccount>,
    pub ata_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GameMetadata {
    pub game_id: u64,
    pub name: String,
    pub symbol: String,
    pub uri: String,
}
