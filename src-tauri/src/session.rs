use crate::{additional_data, crypto, error_handler::Error, storage::MyStore};
use std::sync::{LazyLock, Mutex};

static SESSION: LazyLock<Mutex<Option<String>>> = LazyLock::new(|| Mutex::new(None));

// Session

pub fn add_session(store: &MyStore) -> Result<(), Error> {
  increment_session_counter(store);
  let session = new_session(store)?;
  save_session(session);
  Ok(())
}

fn new_session(store: &MyStore) -> Result<String, Error> {
  let sc = load_session_counter(store)?;
  let aad = additional_data::load_aad()?;
  let data = format!("{aad}{sc}");
  let session = crypto::new_hash(&data)?;
  Ok(session)
}

pub fn is_session_valid(store: &MyStore) -> bool {
  let Ok(current_session) = load_session() else {
    return false;
  };
  let Ok(new_session) = new_session(store) else {
    return false;
  };
  current_session == new_session
}

fn load_session() -> Result<String, Error> {
  let lock = SESSION.lock();

  if lock.is_err() {
    return Err(Error::NotFound("session_not_found".to_string()));
  }

  let mutex = lock.unwrap();

  match &*mutex {
    Some(session) => Ok(session.clone()),
    None => Err(Error::NotFound("session_not_found".to_string())),
  }
}

pub fn remove_session() {
  *SESSION.lock().unwrap() = None;
}

pub fn save_session(session: String) {
  *SESSION.lock().unwrap() = Some(session);
}

// Session counter

fn increment_session_counter(store: &MyStore) -> usize {
  let result = store.get("session_counter");

  match result {
    Some(value) => {
      let data = serde_json::from_value::<usize>(value);
      match data {
        Ok(counter) => {
          let current_counter = counter + 1;
          store.set("session_counter", current_counter);
          current_counter
        }
        Err(_) => {
          let current_counter: usize = 1;
          store.set("session_counter", current_counter);
          current_counter
        }
      }
    }
    None => {
      let current_counter: usize = 1;
      store.set("session_counter", current_counter);
      current_counter
    }
  }
}

fn load_session_counter(store: &MyStore) -> Result<usize, Error> {
  let result = store.get("session_counter");

  match result {
    Some(value) => {
      let data = serde_json::from_value::<usize>(value);
      match data {
        Ok(counter) => Ok(counter),
        Err(_) => Err(Error::Parse("fail_to_parse_session".to_string())),
      }
    }
    None => Err(Error::NotFound("session_not_found".to_string())),
  }
}
