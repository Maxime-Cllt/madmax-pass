use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::prelude::IndexedRandom;
use rand::RngExt;
use zeroize::Zeroize;

pub const MIN_BYTES: usize = 8;
pub const MAX_BYTES: usize = 512;

const ALPHANUMERIC: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/// Génère un token cryptographiquement sécurisé.
///
/// - `bytes`  : taille en octets de l'entropie source (8–512)
/// - `format` : "hex" | "base64url" | "alphanumeric"
///
/// Tous les formats encodent exactement `bytes` octets d'entropie OS.
/// Pour "alphanumeric", le nombre de caractères est ceil(bytes×8 / log₂(62))
/// afin de garantir au moins `bytes×8` bits d'entropie.
pub fn generate(bytes: usize, format: &str) -> Result<String, String> {
    if bytes < MIN_BYTES || bytes > MAX_BYTES {
        return Err(format!(
            "La taille doit être entre {} et {} octets.",
            MIN_BYTES, MAX_BYTES
        ));
    }

    let mut rng = rand::rng();
    let mut raw = vec![0u8; bytes];
    rng.fill(&mut raw[..]);

    let token = match format {
        "hex" => raw.iter().map(|b| format!("{:02x}", b)).collect(),

        "base64url" => URL_SAFE_NO_PAD.encode(&raw),

        "alphanumeric" => {
            // log₂(62) ≈ 5.954 bits/char → chars = ceil(bytes×8 / 5.954)
            let char_count = (bytes as f64 * 8.0 / 5.954_f64).ceil() as usize;
            (0..char_count)
                .map(|_| *ALPHANUMERIC.choose(&mut rng).unwrap() as char)
                .collect()
        }

        _ => return Err("Format inconnu. Valeurs acceptées : hex, base64url, alphanumeric.".into()),
    };

    raw.zeroize();
    Ok(token)
}
