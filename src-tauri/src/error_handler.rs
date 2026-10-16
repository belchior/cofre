// use std::fmt;

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error("{0}")]
  Invalid(String),
  #[error("{0}")]
  InvalidOverride(String),
  #[error("{0}")]
  Parse(String),
  #[error("{0}")]
  NotFound(String),
  #[error(transparent)]
  AesGcm(#[from] aes_gcm::Error),
  #[error(transparent)]
  Serde(#[from] serde_json::Error),
  #[error("unauthorized")]
  Unauthorized,
}

impl serde::Serialize for Error {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: serde::ser::Serializer,
  {
    serializer.serialize_str(self.to_string().as_ref())
  }
}
