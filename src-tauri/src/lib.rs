mod additional_data;
mod auth;
mod crypto;
mod debug;
mod error_handler;
mod session;
mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      #[cfg(debug_assertions)] // only include this code on debug builds
      {
        use tauri::Manager;
        let window = app.get_webview_window("main").unwrap();
        window.open_devtools();
      }
      Ok(())
    })
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      auth::add_sett_ud,
      auth::auth_pin_login,
      auth::clear_storage,
      auth::create_backup,
      auth::has_settings,
      auth::is_name_been_used,
      auth::is_session_valid,
      auth::load_settings,
      auth::load_user_content,
      auth::load_user_data,
      auth::remove_session,
      auth::restore_backup,
      auth::save_settings,
      auth::save_user_content,
      auth::update_sett_ud,
      // development
      debug::dump,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
