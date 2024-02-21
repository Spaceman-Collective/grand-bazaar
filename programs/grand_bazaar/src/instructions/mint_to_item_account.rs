use crate::{
    schemas::{CompressedTokenAccount, CompressedTokenAccountArgs},
    GamePDA, ItemMetadata,
};
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use base64::prelude::*;
use flatbuffers::FlatBufferBuilder;
use mpl_bubblegum::{
    instructions::{UpdateMetadataCpi, UpdateMetadataCpiAccounts, UpdateMetadataInstructionArgs},
    types::{Collection, MetadataArgs, TokenProgramVersion, UpdateArgs},
};
use spl_account_compression::{
    cpi::{accounts::VerifyLeaf, verify_leaf},
    program::SplAccountCompression,
    Noop,
};

pub fn handler(
    ctx: Context<MintToItemAccount>,
    item_metadata: ItemMetadata,
    merkle_info: MerkleInfo,
    game_id: u64,
    amt_increment: u64,
) -> Result<()> {
    let old_uri = item_metadata.uri.clone();
    let compressed_buffer: Vec<u8> = BASE64_STANDARD.decode(old_uri).unwrap();
    let compressed_account: CompressedTokenAccount =
        flatbuffers::root::<CompressedTokenAccount>(&compressed_buffer).unwrap();
    let new_amt = compressed_account.amount() + amt_increment;
    let mut new_flatbuffer = FlatBufferBuilder::new();
    let cta = CompressedTokenAccount::create(
        &mut new_flatbuffer,
        &CompressedTokenAccountArgs { amount: new_amt },
    );
    new_flatbuffer.finish(cta, None);
    let finished_data = new_flatbuffer.finished_data();
    let new_uri = BASE64_STANDARD.encode(finished_data);

    // Verify the Leaf
    verify_leaf(
        CpiContext::new(
            ctx.accounts.spl_compression.to_account_info(),
            VerifyLeaf {
                merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
            },
        ),
        merkle_info.root,
        merkle_info.leaf,
        merkle_info.index,
    )?;

    let gid = game_id.to_le_bytes();
    let seeds = &[b"game".as_ref(), &gid, &[ctx.bumps.game]];
    let signer_seeds = &[&seeds[..]];

    // Update the Leaf
    UpdateMetadataCpi::new(
        &ctx.accounts.bubblegum_program,
        UpdateMetadataCpiAccounts {
            tree_config: &ctx.accounts.tree_authority.to_account_info(),
            authority: &ctx.accounts.game.to_account_info(),
            collection_mint: Some(&ctx.accounts.game_collection_mint.to_account_info()),
            collection_metadata: Some(&ctx.accounts.item_collection_metadata.to_account_info()),
            collection_authority_record_pda: None,
            leaf_owner: &ctx.accounts.account_owner.to_account_info(),
            leaf_delegate: &ctx.accounts.account_owner.to_account_info(),
            payer: &ctx.accounts.signer.to_account_info(),
            merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
            log_wrapper: &ctx.accounts.log_wrapper.to_account_info(),
            compression_program: &ctx.accounts.spl_compression.to_account_info(),
            token_metadata_program: &ctx.accounts.mpl_metadata.to_account_info(),
            system_program: &ctx.accounts.system_program.to_account_info(),
        },
        UpdateMetadataInstructionArgs {
            root: merkle_info.root,
            nonce: merkle_info.nonce,
            index: merkle_info.index,
            current_metadata: MetadataArgs {
                name: item_metadata.name,
                symbol: item_metadata.symbol,
                uri: item_metadata.uri,
                seller_fee_basis_points: 0,
                primary_sale_happened: true,
                is_mutable: true,
                edition_nonce: None,
                token_standard: None,
                collection: Some(Collection {
                    verified: false,
                    key: ctx.accounts.item_collection_mint.key(),
                }),
                uses: None,
                token_program_version: TokenProgramVersion::Original,
                creators: vec![],
            },
            update_args: UpdateArgs {
                uri: Some(new_uri),
                name: None,
                symbol: None,
                creators: None,
                seller_fee_basis_points: None,
                primary_sale_happened: None,
                is_mutable: None,
            },
        },
    )
    .invoke_signed(signer_seeds)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(item_metadata: ItemMetadata, merkle_info: MerkleInfo, game_id: u64, amt_increment: u64)]
pub struct MintToItemAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,

    #[account(
        seeds = [b"game".as_ref(), game_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub game: Account<'info, GamePDA>,

    // Verify Leaf
    /// CHECK: This account is modified in the downstream program
    pub merkle_tree: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub spl_compression: Program<'info, SplAccountCompression>,

    // Update Metadata
    /// CHECK: Checked via ID
    #[account(address = mpl_bubblegum::ID)]
    pub bubblegum_program: UncheckedAccount<'info>,
    /// CHECK: This account is neither written to nor read from.
    #[account(mut)]
    pub tree_authority: UncheckedAccount<'info>,
    #[account(
        constraint = game_collection_mint.mint_authority == Some(game.key()).into()
    )]
    pub game_collection_mint: Account<'info, Mint>,
    /// CHECK: Checked in BGUM
    pub item_collection_metadata: UncheckedAccount<'info>,
    /// CHECK: Checked in BGUM
    pub account_owner: UncheckedAccount<'info>,
    /// CHECK: Checked in BGUM
    pub mpl_metadata: UncheckedAccount<'info>,
    /// CHECK: Checked in BGUM
    pub item_collection_mint: UncheckedAccount<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug)]
pub struct MerkleInfo {
    merkle_tree: Pubkey,
    root: [u8; 32],
    leaf: [u8; 32],
    nonce: u64,
    index: u32,
    proof_index_start: u8,
    proof_index_end: u8,
}
