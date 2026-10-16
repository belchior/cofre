use crate::error_handler::Error;
use aes_gcm::{
  Aes256Gcm, Nonce,
  aead::{self, Aead, Generate, Key, KeyInit, Payload},
  aes,
};
// use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use serde::{Deserialize, Serialize};

// Hash

pub fn new_hash(text: &str) -> Result<String, Error> {
  let hs = blake3::hash(text.as_bytes());
  Ok(hs.to_string())
}

// pub fn new_password_hash(text: &str) -> Result<String, Error> {
//   let argon2 = Argon2::default();
//   let hash = argon2.hash_password(text.as_bytes());
//   match hash {
//     Ok(hash) => Ok(hash.to_string()),
//     Err(_) => Err(Error::Parse("fail_to_hash_text".to_string())),
//   }
// }

// pub fn verify_password_hash(text: &str, hashed_text: &str) -> Result<bool, Error> {
//   let parsed_hash = PasswordHash::new(&hashed_text).unwrap();
//   let is_valid = Argon2::default().verify_password(text.as_bytes(), &parsed_hash).is_ok();
//   Ok(is_valid)
// }

// Encrypt/Decrypt

pub type CipherKey = aes::cipher::Array<u8, aead::consts::U32>;
pub type CipherNonce = aes::cipher::Array<u8, aead::consts::U12>;

#[derive(Debug, Serialize, Deserialize)]
pub struct KeyNonces {
  pub key: [u8; 32],
  pub nonce_sett: [u8; 12],
  pub nonce_user_data: [u8; 12],
  pub nonce_user_content: [u8; 12],
}
impl KeyNonces {
  pub fn new() -> Self {
    let key = Key::<Aes256Gcm>::generate().as_array().unwrap().to_owned();
    let nonce_sett = Nonce::<aead::consts::U12>::generate()
      .as_array()
      .to_owned()
      .unwrap()
      .to_owned();
    let nonce_user_data = Nonce::<aead::consts::U12>::generate()
      .as_array()
      .to_owned()
      .unwrap()
      .to_owned();
    let nonce_user_content = Nonce::<aead::consts::U12>::generate()
      .as_array()
      .to_owned()
      .unwrap()
      .to_owned();

    Self {
      key,
      nonce_sett,
      nonce_user_data,
      nonce_user_content,
    }
  }

  pub fn new_key(key: [u8; 32]) -> CipherKey {
    aes::cipher::Array(key)
  }

  pub fn new_nonce(nonce: [u8; 12]) -> CipherNonce {
    aes::cipher::Array(nonce)
  }

  pub fn key_nonce_sett(kn: &Self) -> (CipherKey, CipherNonce) {
    (Self::new_key(kn.key), Self::new_nonce(kn.nonce_sett))
  }

  pub fn key_nonce_user_data(kn: &Self) -> (CipherKey, CipherNonce) {
    (Self::new_key(kn.key), Self::new_nonce(kn.nonce_user_data))
  }

  pub fn key_nonce_user_content(kn: &Self) -> (CipherKey, CipherNonce) {
    (Self::new_key(kn.key), Self::new_nonce(kn.nonce_user_content))
  }
}

pub fn encrypt(text: &str, key: &CipherKey, nonce: &CipherNonce) -> Result<Vec<u8>, Error> {
  let cipher = Aes256Gcm::new(&key);
  let ciphertext = cipher.encrypt(&nonce, text.as_bytes())?;
  Ok(ciphertext)
}

pub fn decrypt(ciphertext: Vec<u8>, key: &CipherKey, nonce: &CipherNonce) -> Result<String, Error> {
  let cipher = Aes256Gcm::new(key);
  let decrypted = cipher.decrypt(nonce, &ciphertext[..])?;
  let text = String::from_utf8(decrypted);
  match text {
    Ok(text) => Ok(text),
    Err(err) => {
      eprintln!("{err}");
      Err(Error::Parse("decrypt_fail".to_string()))
    }
  }
}

pub fn encrypt_with_aad(text: &str, key: &CipherKey, nonce: &CipherNonce, aad: &[u8]) -> Result<Vec<u8>, Error> {
  let cipher = Aes256Gcm::new(&key);
  let payload = Payload {
    aad,
    msg: text.as_bytes(),
  };
  let ciphertext = cipher.encrypt(&nonce, payload)?;
  Ok(ciphertext)
}

pub fn decrypt_with_aad(
  ciphertext: Vec<u8>,
  key: &CipherKey,
  nonce: &CipherNonce,
  aad: &[u8],
) -> Result<String, Error> {
  let cipher = Aes256Gcm::new(key);
  let payload = Payload { aad, msg: &ciphertext };
  let decrypted = cipher.decrypt(nonce, payload)?;
  let text = String::from_utf8(decrypted);
  match text {
    Ok(text) => Ok(text),
    Err(err) => {
      eprintln!("{err}");
      Err(Error::Parse("decrypt_fail".to_string()))
    }
  }
}

// Key / Nonce

#[cfg(test)]
mod test_crypto {
  use crate::crypto::{KeyNonces, decrypt, encrypt, new_hash};
  use aes_gcm::{
    Aes256Gcm, Nonce,
    aead::{
      Generate, Key,
      consts::{U12, U32},
    },
    aes::cipher::Array,
  };

  #[test]
  fn test_new_hash() {
    let text = "hello world";
    let hash1 = new_hash(text).unwrap();
    let hash2 = new_hash(text).unwrap();

    assert_ne!(text, hash1);
    assert_eq!(hash1, hash2);
  }

  #[test]
  fn test_encrypt_decrypt() {
    let text = "hello world";
    let key = Key::<Aes256Gcm>::generate();
    let nonce = Nonce::generate();

    let serialized_key: &[u8; 32] = (&key).into();
    let key2 = Array::<u8, U32>(*serialized_key);
    let serialized_nonce: &[u8; 12] = (&nonce).into();
    let nonce2 = Array::<u8, U12>(*serialized_nonce);

    let ciphertext = encrypt(text, &key, &nonce).unwrap();
    let plaintext = decrypt(ciphertext, &key2, &nonce2).unwrap();

    assert_eq!(&plaintext, text);
  }

  #[test]
  fn test_keynonce_builder() {
    let text = "hello world";
    let kn = KeyNonces::new();
    let key = KeyNonces::new_key(kn.key);
    let nonce = KeyNonces::new_nonce(kn.nonce_sett);

    let ciphertext = encrypt(text, &key, &nonce).unwrap();
    let plaintext = decrypt(ciphertext, &key, &nonce).unwrap();

    assert_eq!(&plaintext, text);
  }
}
