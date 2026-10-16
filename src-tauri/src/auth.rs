use crate::{
  additional_data,
  crypto::{self, KeyNonces},
  error_handler::Error,
  session,
  storage::{self, MyStore, STORE_NAME},
};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use tauri::Manager;
use tauri_plugin_store::StoreExt;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

// -- Login ------------------------------------------------------------------------

#[tauri::command]
pub fn auth_pin_login(app: tauri::AppHandle, raw_pin: &str) -> Result<bool, Error> {
  let store = app.store(STORE_NAME).unwrap();
  let pin = new_pin(raw_pin)?;
  let is_valid = is_pin_valid(&store, &pin);

  if is_valid == false {
    return Err(Error::Unauthorized);
  }
  let _ = additional_data::add_aad_from_pin(&pin)?;
  let _ = session::add_session(&store)?;
  Ok(true)
}

pub fn is_pin_valid(store: &MyStore, temp_pin: &str) -> bool {
  let Ok(ciphertext) = storage::load_user_data(&store) else {
    return false;
  };
  let Ok(kn) = storage::load_key_nonces(&store) else {
    return false;
  };
  let (key, nonce) = KeyNonces::key_nonce_user_data(&kn);

  // Creates a temp aad to test decryption and compare pin value
  let Ok(temp_aad) = additional_data::new_aad_from_pin(&temp_pin) else {
    return false;
  };
  let Ok(decrypted) = crypto::decrypt_with_aad(ciphertext, &key, &nonce, &temp_aad.into_bytes()) else {
    return false;
  };
  let Ok(ud) = serde_json::from_str::<UserData>(&decrypted) else {
    return false;
  };
  let Some(pin) = ud.pin else {
    return false;
  };

  temp_pin == pin
}

// -- Session ------------------------------------------------------------------------

#[tauri::command]
pub fn is_session_valid(app: tauri::AppHandle) -> bool {
  let store = app.store(STORE_NAME).unwrap();
  session::is_session_valid(&store)
}

#[tauri::command]
pub fn remove_session() -> Result<(), Error> {
  session::remove_session();
  Ok(())
}

// -- Utils ------------------------------------------------------------------------

fn aad_has_change(store: &MyStore, new_sett: &Settings, new_ud: &UserData) -> Result<bool, Error> {
  let store_sett = load_sett(store)?;
  let store_ud = load_ud(store)?;

  if enable_auth_methods(new_sett) != enable_auth_methods(&store_sett) {
    return Ok(true);
  }

  if new_sett.enable_pin_auth == true && store_ud.pin != new_ud.pin {
    return Ok(true);
  }

  if new_sett.enable_biometric_auth == true && store_ud.passkey.is_none() && new_ud.passkey.is_some() {
    return Ok(true);
  }

  // TODO implement comparison of passkey.id

  Ok(false)
}

// -- Settings ------------------------------------------------------------------------

#[derive(Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
  pub enable_pin_auth: bool,
  pub enable_biometric_auth: bool,
  pub enable_auto_update: bool,
}
impl FromStr for Settings {
  type Err = Error;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    let result = serde_json::from_str(s);
    match result {
      Ok(sett) => Ok(sett),
      Err(err) => Err(Error::Serde(err)),
    }
  }
}

#[derive(PartialEq)]
enum AuthOptions {
  PinAuth,
  BiometricAuth,
}
fn enable_auth_methods(sett: &Settings) -> Option<AuthOptions> {
  match sett {
    Settings {
      enable_pin_auth: true, ..
    } => Some(AuthOptions::PinAuth),
    Settings {
      enable_biometric_auth: true,
      ..
    } => Some(AuthOptions::BiometricAuth),
    _ => None,
  }
}

fn load_sett(store: &MyStore) -> Result<Settings, Error> {
  let ciphertext = storage::load_settings(&store)?;
  let kn = storage::load_key_nonces(&store)?;
  let (key, nonce) = KeyNonces::key_nonce_sett(&kn);
  let text = crypto::decrypt(ciphertext, &key, &nonce)?;
  text.parse()
}

fn save_sett(sett: &Settings, kn: &KeyNonces, store: &MyStore) -> Result<(), Error> {
  let text = serde_json::to_string(&sett)?;
  let (key, nonce) = KeyNonces::key_nonce_sett(kn);
  let encrypted = crypto::encrypt(&text, &key, &nonce)?;
  storage::save_settings(&store, encrypted)
}

#[tauri::command]
pub fn has_settings(app: tauri::AppHandle) -> Result<bool, Error> {
  let store = app.store(STORE_NAME).unwrap();
  let sett = load_sett(&store)?;
  let result = is_settings_valid(&sett);
  Ok(result)
}

pub fn is_settings_valid(sett: &Settings) -> bool {
  match sett {
    Settings {
      enable_pin_auth: true, ..
    } => true,
    Settings {
      enable_biometric_auth: true,
      ..
    } => true,
    _ => false,
  }
}

#[tauri::command]
pub fn load_settings(app: tauri::AppHandle) -> Result<String, Error> {
  let store = app.store(STORE_NAME).unwrap();
  let ciphertext = storage::load_settings(&store)?;
  let kn = storage::load_key_nonces(&store)?;
  let (key, nonce) = KeyNonces::key_nonce_sett(&kn);
  crypto::decrypt(ciphertext, &key, &nonce)
}

#[tauri::command]
pub fn save_settings(app: tauri::AppHandle, sett: Settings) -> Result<(), Error> {
  let store = app.store(STORE_NAME).unwrap();
  let kn = storage::load_key_nonces(&store)?;
  let (key, nonce) = KeyNonces::key_nonce_sett(&kn);
  let text = serde_json::to_string(&sett)?;
  let encrypted = crypto::encrypt(&text, &key, &nonce)?;
  storage::save_settings(&store, encrypted)
}

#[tauri::command]
pub fn add_sett_ud(app: tauri::AppHandle, sett: Settings, mut ud: UserData) -> Result<(), Error> {
  if is_settings_valid(&sett) == false {
    return Err(Error::Invalid("invalid_settings".to_string()));
  }

  let store = app.store(STORE_NAME).unwrap();

  if storage::has_settings(&store) || storage::has_user_data(&store) {
    return Err(Error::InvalidOverride("override_are_not_allowed".to_string()));
  }

  let kn = KeyNonces::new();

  // Encrypt and save Settings
  let _ = save_sett(&sett, &kn, &store)?;

  // Encrypt and save User Data
  if let Some(raw_pin) = &ud.pin
    && let Ok(pin) = new_pin(raw_pin)
  {
    ud.pin = Some(pin);
  }
  additional_data::add_aad(&sett, &ud)?;
  let _ = save_ud(ud, &kn, &store)?;

  // Save KeyNonces
  storage::save_key_nonces(&store, kn);

  Ok(())
}

#[tauri::command]
pub fn update_sett_ud(app: tauri::AppHandle, sett: Settings, mut ud: UserData) -> Result<(), Error> {
  if is_settings_valid(&sett) == false {
    return Err(Error::Invalid("invalid_settings".to_string()));
  }

  let store = app.store(STORE_NAME).unwrap();
  let kn = storage::load_key_nonces(&store)?;

  if let Some(raw_pin) = &ud.pin
    && let Ok(pin) = new_pin(raw_pin)
  {
    ud.pin = Some(pin);
  }
  if aad_has_change(&store, &sett, &ud)? {
    let content = load_content(&store)?;
    additional_data::add_aad(&sett, &ud)?;
    let _ = session::add_session(&store)?;
    let _ = save_content(content, &kn, &store)?;
  }

  // Overrides the previous sett and ud

  let _ = save_sett(&sett, &kn, &store);
  let _ = save_ud(ud, &kn, &store)?;
  Ok(())
}

// -- User Data ------------------------------------------------------------------------

#[derive(Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum CustomFieldType {
  #[default]
  Text,
  Password,
}
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct CustomField {
  pub name: String,
  pub index: usize,
  pub value: String,
  pub r#type: CustomFieldType,
}

#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Content {
  created_at: String,
  custom_fields: Vec<CustomField>,
  id: String,
  length: usize,
  name: String,
  secret: String,
  starred: bool,
}

#[derive(Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum PublicKeyCredentialType {
  #[default]
  PublicKey,
}
#[derive(Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum AuthenticatorTransport {
  Ble,
  Hybrid,
  #[default]
  Internal,
  Nfc,
  Usb,
}
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct PassKey {
  pub id: String,
  pub transports: AuthenticatorTransport,
  pub r#type: PublicKeyCredentialType,
}

#[derive(Debug, Default, Deserialize, Serialize)]
pub struct UserData {
  pub passkey: Option<PassKey>,
  pub pin: Option<String>,
}
impl FromStr for UserData {
  type Err = Error;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    let result = serde_json::from_str(s);
    match result {
      Ok(ud) => Ok(ud),
      Err(err) => Err(Error::Serde(err)),
    }
  }
}

type Pin = String;
pub fn new_pin(raw_pin: &str) -> Result<Pin, Error> {
  crypto::new_hash(raw_pin)
}

fn load_ud(store: &MyStore) -> Result<UserData, Error> {
  let ciphertext = storage::load_user_data(&store)?;
  let kn = storage::load_key_nonces(&store)?;
  let (key, nonce) = KeyNonces::key_nonce_user_data(&kn);
  let aad = additional_data::load_aad()?;
  let text = crypto::decrypt_with_aad(ciphertext, &key, &nonce, aad.as_bytes())?;
  text.parse()
}

fn load_content(store: &MyStore) -> Result<Vec<Content>, Error> {
  let ciphertext = storage::load_user_content(&store)?;
  let kn = storage::load_key_nonces(&store)?;
  let (key, nonce) = KeyNonces::key_nonce_user_content(&kn);
  let aad = additional_data::load_aad()?;
  let text = crypto::decrypt_with_aad(ciphertext, &key, &nonce, aad.as_bytes())?;
  let value = serde_json::from_str::<Vec<Content>>(&text)?;
  Ok(value)
}

fn save_content(content: Vec<Content>, kn: &KeyNonces, store: &MyStore) -> Result<(), Error> {
  let (key, nonce) = KeyNonces::key_nonce_user_content(&kn);
  let text = serde_json::to_string(&content)?;
  let aad = additional_data::load_aad()?;
  let encrypted = crypto::encrypt_with_aad(&text, &key, &nonce, &aad.as_bytes())?;
  storage::save_user_content(&store, encrypted)
}

fn save_ud(ud: UserData, kn: &KeyNonces, store: &MyStore) -> Result<(), Error> {
  let text = serde_json::to_string(&ud)?;
  let (key, nonce) = KeyNonces::key_nonce_user_data(kn);
  let aad = additional_data::load_aad()?;
  let encrypted = crypto::encrypt_with_aad(&text, &key, &nonce, aad.as_bytes())?;
  storage::save_user_data(&store, encrypted)
}

#[tauri::command]
pub fn is_name_been_used(app: tauri::AppHandle, name: &str) -> Result<bool, Error> {
  let store = app.store(STORE_NAME).unwrap();
  let content = load_content(&store)?;
  let value = content
    .iter()
    .find(|item| item.name.to_lowercase() == name.to_lowercase());

  match value {
    Some(_) => Ok(true),
    None => Ok(false),
  }
}

#[tauri::command]
pub fn load_user_data(app: tauri::AppHandle) -> Result<String, Error> {
  let store = app.store(STORE_NAME).unwrap();
  let Ok(ciphertext) = storage::load_user_data(&store) else {
    panic!("user_data_not_found");
  };
  let kn = storage::load_key_nonces(&store)?;
  let (key, nonce) = KeyNonces::key_nonce_user_data(&kn);
  let aad = additional_data::load_aad()?;
  crypto::decrypt_with_aad(ciphertext, &key, &nonce, aad.as_bytes())
}

#[tauri::command]
pub fn load_user_content(app: tauri::AppHandle) -> Result<String, Error> {
  let store = app.store(STORE_NAME).unwrap();
  let Ok(ciphertext) = storage::load_user_content(&store) else {
    return Ok("[]".to_string());
  };
  let kn = storage::load_key_nonces(&store)?;
  let (key, nonce) = KeyNonces::key_nonce_user_content(&kn);
  let aad = additional_data::load_aad()?;
  crypto::decrypt_with_aad(ciphertext, &key, &nonce, aad.as_bytes())
}

#[tauri::command]
pub fn save_user_content(app: tauri::AppHandle, user_content: Vec<Content>) -> Result<(), Error> {
  let store = app.store(STORE_NAME).unwrap();
  let kn = storage::load_key_nonces(&store)?;
  let (key, nonce) = KeyNonces::key_nonce_user_content(&kn);
  let text = serde_json::to_string(&user_content)?;
  let aad = additional_data::load_aad()?;
  let encrypted = crypto::encrypt_with_aad(&text, &key, &nonce, &aad.as_bytes())?;
  storage::save_user_content(&store, encrypted)
}

// -- Backup ------------------------------------------------------------------------

// TODO improves error handlers
#[tauri::command]
pub async fn create_backup(app: tauri::AppHandle) -> Result<String, Error> {
  let store = app.store(STORE_NAME).unwrap();
  if session::is_session_valid(&store) == false {
    return Err(Error::Unauthorized);
  }

  let p = format!(
    "{}/{}",
    app.path().app_data_dir().unwrap().into_string().unwrap(),
    STORE_NAME
  );

  let mut file = tokio::fs::File::open(p).await.unwrap();
  let mut buf = String::new();
  file.read_to_string(&mut buf).await.unwrap();
  buf = buf.replace("\n", "").replace(" ", "");
  Ok(buf)
}

// TODO improves error handlers
#[tauri::command]
pub async fn restore_backup(app: tauri::AppHandle, data: String) -> Result<bool, Error> {
  let store = app.store(STORE_NAME).unwrap();
  if session::is_session_valid(&store) == false {
    return Err(Error::Unauthorized);
  }

  let p = format!(
    "{}/{}",
    app.path().app_data_dir().unwrap().into_string().unwrap(),
    STORE_NAME
  );

  let mut file = tokio::fs::File::create(p).await.unwrap();
  file.write_all(data.as_bytes()).await.unwrap();
  file.flush().await.unwrap();
  store.close_resource();
  Ok(true)
}

#[tauri::command]
pub fn clear_storage(app: tauri::AppHandle) -> Result<bool, Error> {
  let store = app.store(STORE_NAME).unwrap();

  if session::is_session_valid(&store) == false {
    return Err(Error::Unauthorized);
  }

  store.clear();
  store.save().unwrap();

  Ok(true)
}
