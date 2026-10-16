mod key_nonces;
mod settings;
mod user_data;

pub use crate::storage::{key_nonces::*, settings::*, user_data::*};
use std::sync::Arc;
use tauri::Wry;
use tauri_plugin_store::Store;

pub const STORE_NAME: &str = "cofre.json";
pub type MyStore = Arc<Store<Wry>>;
