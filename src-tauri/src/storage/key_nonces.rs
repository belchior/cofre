use crate::{crypto::KeyNonces, error_handler::Error, storage::MyStore};

pub fn load_key_nonces(store: &MyStore) -> Result<KeyNonces, Error> {
  let value = store.get("key_nonces");

  match value {
    Some(value) => {
      let data = serde_json::from_value::<KeyNonces>(value);
      match data {
        Ok(data) => Ok(data),
        Err(_) => Err(Error::Parse("fail_to_parse_key_nonces".to_string())),
      }
    }
    None => Err(Error::NotFound("key_nonces_not_found".to_string())),
  }
}

pub fn save_key_nonces(store: &MyStore, kn: KeyNonces) -> () {
  let value = serde_json::to_value(kn).unwrap();
  store.set("key_nonces", value);
}
