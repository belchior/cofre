use crate::{error_handler::Error, storage::MyStore};

// Commands

pub fn has_settings(store: &MyStore) -> bool {
  match store.get("settings") {
    Some(_) => true,
    _ => false,
  }
}

pub fn load_settings(store: &MyStore) -> Result<Vec<u8>, Error> {
  let value = store.get("settings");

  match value {
    Some(value) => {
      let sett = serde_json::from_value::<Vec<u8>>(value);
      match sett {
        Ok(sett) => Ok(sett),
        Err(err) => {
          eprintln!("{err}");
          Err(Error::Parse("fail_to_parse_settings".to_string()))
        }
      }
    }
    None => Err(Error::NotFound("settings_not_found".to_string())),
  }
}

pub fn save_settings(store: &MyStore, sett: Vec<u8>) -> Result<(), Error> {
  let value = serde_json::to_value(sett)?;
  store.set("settings", value);
  Ok(())
}
