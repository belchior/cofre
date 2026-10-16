use crate::{error_handler::Error, storage::MyStore};

pub fn has_user_data(store: &MyStore) -> bool {
  match store.get("user_data") {
    Some(_) => true,
    _ => false,
  }
}

pub fn load_user_content(store: &MyStore) -> Result<Vec<u8>, Error> {
  let value = store.get("user_content");
  match value {
    Some(value) => {
      let value = serde_json::from_value::<Vec<u8>>(value);
      match value {
        Ok(content) => Ok(content),
        Err(_) => Err(Error::Parse("fail_to_parse_user_content".to_string())),
      }
    }
    None => Err(Error::NotFound("user_content_not_found".to_string())),
  }
}
pub fn save_user_content(store: &MyStore, ud: Vec<u8>) -> Result<(), Error> {
  let value = serde_json::to_value(ud)?;
  store.set("user_content", value);
  Ok(())
}

pub fn load_user_data(store: &MyStore) -> Result<Vec<u8>, Error> {
  let value = store.get("user_data");
  match value {
    Some(value) => {
      let ud = serde_json::from_value::<Vec<u8>>(value);
      match ud {
        Ok(ud) => Ok(ud),
        Err(_) => Err(Error::Parse("fail_to_parse_user_data".to_string())),
      }
    }
    None => Err(Error::NotFound("user_data_not_found".to_string())),
  }
}
pub fn save_user_data(store: &MyStore, ud: Vec<u8>) -> Result<(), Error> {
  let value = serde_json::to_value(ud)?;
  store.set("user_data", value);
  Ok(())
}
