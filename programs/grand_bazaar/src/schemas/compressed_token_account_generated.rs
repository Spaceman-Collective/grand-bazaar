// automatically generated by the FlatBuffers compiler, do not modify


// @generated

use core::mem;
use core::cmp::Ordering;

extern crate flatbuffers;
use self::flatbuffers::{EndianScalar, Follow};

pub enum CompressedTokenAccountOffset {}
#[derive(Copy, Clone, PartialEq)]

pub struct CompressedTokenAccount<'a> {
  pub _tab: flatbuffers::Table<'a>,
}

impl<'a> flatbuffers::Follow<'a> for CompressedTokenAccount<'a> {
  type Inner = CompressedTokenAccount<'a>;
  #[inline]
  unsafe fn follow(buf: &'a [u8], loc: usize) -> Self::Inner {
    Self { _tab: flatbuffers::Table::new(buf, loc) }
  }
}

impl<'a> CompressedTokenAccount<'a> {
  pub const VT_COLLECTION_ID: flatbuffers::VOffsetT = 4;
  pub const VT_AMOUNT: flatbuffers::VOffsetT = 6;

  #[inline]
  pub unsafe fn init_from_table(table: flatbuffers::Table<'a>) -> Self {
    CompressedTokenAccount { _tab: table }
  }
  #[allow(unused_mut)]
  pub fn create<'bldr: 'args, 'args: 'mut_bldr, 'mut_bldr>(
    _fbb: &'mut_bldr mut flatbuffers::FlatBufferBuilder<'bldr>,
    args: &'args CompressedTokenAccountArgs<'args>
  ) -> flatbuffers::WIPOffset<CompressedTokenAccount<'bldr>> {
    let mut builder = CompressedTokenAccountBuilder::new(_fbb);
    builder.add_amount(args.amount);
    if let Some(x) = args.collection_id { builder.add_collection_id(x); }
    builder.finish()
  }


  #[inline]
  pub fn collection_id(&self) -> Option<flatbuffers::Vector<'a, u8>> {
    // Safety:
    // Created from valid Table for this object
    // which contains a valid value in this slot
    unsafe { self._tab.get::<flatbuffers::ForwardsUOffset<flatbuffers::Vector<'a, u8>>>(CompressedTokenAccount::VT_COLLECTION_ID, None)}
  }
  #[inline]
  pub fn amount(&self) -> u64 {
    // Safety:
    // Created from valid Table for this object
    // which contains a valid value in this slot
    unsafe { self._tab.get::<u64>(CompressedTokenAccount::VT_AMOUNT, Some(0)).unwrap()}
  }
}

impl flatbuffers::Verifiable for CompressedTokenAccount<'_> {
  #[inline]
  fn run_verifier(
    v: &mut flatbuffers::Verifier, pos: usize
  ) -> Result<(), flatbuffers::InvalidFlatbuffer> {
    use self::flatbuffers::Verifiable;
    v.visit_table(pos)?
     .visit_field::<flatbuffers::ForwardsUOffset<flatbuffers::Vector<'_, u8>>>("collection_id", Self::VT_COLLECTION_ID, false)?
     .visit_field::<u64>("amount", Self::VT_AMOUNT, false)?
     .finish();
    Ok(())
  }
}
pub struct CompressedTokenAccountArgs<'a> {
    pub collection_id: Option<flatbuffers::WIPOffset<flatbuffers::Vector<'a, u8>>>,
    pub amount: u64,
}
impl<'a> Default for CompressedTokenAccountArgs<'a> {
  #[inline]
  fn default() -> Self {
    CompressedTokenAccountArgs {
      collection_id: None,
      amount: 0,
    }
  }
}

pub struct CompressedTokenAccountBuilder<'a: 'b, 'b> {
  fbb_: &'b mut flatbuffers::FlatBufferBuilder<'a>,
  start_: flatbuffers::WIPOffset<flatbuffers::TableUnfinishedWIPOffset>,
}
impl<'a: 'b, 'b> CompressedTokenAccountBuilder<'a, 'b> {
  #[inline]
  pub fn add_collection_id(&mut self, collection_id: flatbuffers::WIPOffset<flatbuffers::Vector<'b , u8>>) {
    self.fbb_.push_slot_always::<flatbuffers::WIPOffset<_>>(CompressedTokenAccount::VT_COLLECTION_ID, collection_id);
  }
  #[inline]
  pub fn add_amount(&mut self, amount: u64) {
    self.fbb_.push_slot::<u64>(CompressedTokenAccount::VT_AMOUNT, amount, 0);
  }
  #[inline]
  pub fn new(_fbb: &'b mut flatbuffers::FlatBufferBuilder<'a>) -> CompressedTokenAccountBuilder<'a, 'b> {
    let start = _fbb.start_table();
    CompressedTokenAccountBuilder {
      fbb_: _fbb,
      start_: start,
    }
  }
  #[inline]
  pub fn finish(self) -> flatbuffers::WIPOffset<CompressedTokenAccount<'a>> {
    let o = self.fbb_.end_table(self.start_);
    flatbuffers::WIPOffset::new(o.value())
  }
}

impl core::fmt::Debug for CompressedTokenAccount<'_> {
  fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
    let mut ds = f.debug_struct("CompressedTokenAccount");
      ds.field("collection_id", &self.collection_id());
      ds.field("amount", &self.amount());
      ds.finish()
  }
}
#[inline]
/// Verifies that a buffer of bytes contains a `CompressedTokenAccount`
/// and returns it.
/// Note that verification is still experimental and may not
/// catch every error, or be maximally performant. For the
/// previous, unchecked, behavior use
/// `root_as_compressed_token_account_unchecked`.
pub fn root_as_compressed_token_account(buf: &[u8]) -> Result<CompressedTokenAccount, flatbuffers::InvalidFlatbuffer> {
  flatbuffers::root::<CompressedTokenAccount>(buf)
}
#[inline]
/// Verifies that a buffer of bytes contains a size prefixed
/// `CompressedTokenAccount` and returns it.
/// Note that verification is still experimental and may not
/// catch every error, or be maximally performant. For the
/// previous, unchecked, behavior use
/// `size_prefixed_root_as_compressed_token_account_unchecked`.
pub fn size_prefixed_root_as_compressed_token_account(buf: &[u8]) -> Result<CompressedTokenAccount, flatbuffers::InvalidFlatbuffer> {
  flatbuffers::size_prefixed_root::<CompressedTokenAccount>(buf)
}
#[inline]
/// Verifies, with the given options, that a buffer of bytes
/// contains a `CompressedTokenAccount` and returns it.
/// Note that verification is still experimental and may not
/// catch every error, or be maximally performant. For the
/// previous, unchecked, behavior use
/// `root_as_compressed_token_account_unchecked`.
pub fn root_as_compressed_token_account_with_opts<'b, 'o>(
  opts: &'o flatbuffers::VerifierOptions,
  buf: &'b [u8],
) -> Result<CompressedTokenAccount<'b>, flatbuffers::InvalidFlatbuffer> {
  flatbuffers::root_with_opts::<CompressedTokenAccount<'b>>(opts, buf)
}
#[inline]
/// Verifies, with the given verifier options, that a buffer of
/// bytes contains a size prefixed `CompressedTokenAccount` and returns
/// it. Note that verification is still experimental and may not
/// catch every error, or be maximally performant. For the
/// previous, unchecked, behavior use
/// `root_as_compressed_token_account_unchecked`.
pub fn size_prefixed_root_as_compressed_token_account_with_opts<'b, 'o>(
  opts: &'o flatbuffers::VerifierOptions,
  buf: &'b [u8],
) -> Result<CompressedTokenAccount<'b>, flatbuffers::InvalidFlatbuffer> {
  flatbuffers::size_prefixed_root_with_opts::<CompressedTokenAccount<'b>>(opts, buf)
}
#[inline]
/// Assumes, without verification, that a buffer of bytes contains a CompressedTokenAccount and returns it.
/// # Safety
/// Callers must trust the given bytes do indeed contain a valid `CompressedTokenAccount`.
pub unsafe fn root_as_compressed_token_account_unchecked(buf: &[u8]) -> CompressedTokenAccount {
  flatbuffers::root_unchecked::<CompressedTokenAccount>(buf)
}
#[inline]
/// Assumes, without verification, that a buffer of bytes contains a size prefixed CompressedTokenAccount and returns it.
/// # Safety
/// Callers must trust the given bytes do indeed contain a valid size prefixed `CompressedTokenAccount`.
pub unsafe fn size_prefixed_root_as_compressed_token_account_unchecked(buf: &[u8]) -> CompressedTokenAccount {
  flatbuffers::size_prefixed_root_unchecked::<CompressedTokenAccount>(buf)
}
#[inline]
pub fn finish_compressed_token_account_buffer<'a, 'b>(
    fbb: &'b mut flatbuffers::FlatBufferBuilder<'a>,
    root: flatbuffers::WIPOffset<CompressedTokenAccount<'a>>) {
  fbb.finish(root, None);
}

#[inline]
pub fn finish_size_prefixed_compressed_token_account_buffer<'a, 'b>(fbb: &'b mut flatbuffers::FlatBufferBuilder<'a>, root: flatbuffers::WIPOffset<CompressedTokenAccount<'a>>) {
  fbb.finish_size_prefixed(root, None);
}
