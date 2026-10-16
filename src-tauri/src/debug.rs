use crate::{
  error_handler::Error,
  storage::{self, STORE_NAME},
};
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub fn dump(app: tauri::AppHandle) -> Result<(), Error> {
  let store = app.store(STORE_NAME).unwrap();
  let sett = storage::load_settings(&store);
  let user_data = storage::load_user_data(&store);
  let key_nonces = storage::load_key_nonces(&store);

  println!("\nsett: {:?}", sett);
  println!("\nuser_data: {:?}", user_data);
  println!("\nkey_nonces: {:?}", key_nonces);

  Ok(())
}
