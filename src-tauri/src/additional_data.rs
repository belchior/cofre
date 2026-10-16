use crate::{
  auth::{Settings, UserData},
  crypto,
  error_handler::Error,
};
use std::sync::{LazyLock, Mutex};

static AAD: LazyLock<Mutex<Option<String>>> = LazyLock::new(|| Mutex::new(None));

fn save_aad(aad: String) {
  *AAD.lock().unwrap() = Some(aad);
}

pub fn add_aad(sett: &Settings, ud: &UserData) -> Result<(), Error> {
  match sett {
    Settings {
      enable_pin_auth: true, ..
    } => {
      if ud.pin.is_none() {
        return Err(Error::NotFound("pin_not_found".to_string()));
      }
      let pin = ud.pin.clone().unwrap();
      let aad = new_aad_from_pin(&pin)?;
      save_aad(aad);
      Ok(())
    }
    _ => {
      unimplemented!()
    }
  }
}

pub fn add_aad_from_pin(pin: &str) -> Result<(), Error> {
  let aad = new_aad_from_pin(pin)?;
  save_aad(aad);
  Ok(())
}

pub fn load_aad() -> Result<String, Error> {
  let lock = AAD.lock();

  if lock.is_err() {
    return Err(Error::NotFound("aad_not_found".to_string()));
  }

  let mutex = lock.unwrap();

  match &*mutex {
    Some(aad) => Ok(aad.clone()),
    None => Err(Error::NotFound("aad_not_found".to_string())),
  }
}

pub fn new_aad_from_pin(pin: &str) -> Result<String, Error> {
  crypto::new_hash(pin)
}
