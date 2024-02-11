pub mod game_pda;

pub use game_pda::*;


pub trait MaxSize {
    fn get_max_size() -> usize;
}