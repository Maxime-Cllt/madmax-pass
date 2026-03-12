use rand::prelude::IndexedRandom;
use rand::seq::SliceRandom;
use zeroize::Zeroize;

const MIN_LEN: usize = 4;
const MAX_LEN: usize = 4096;

const LOWER: &[u8] = b"abcdefghijklmnopqrstuvwxyz";
const UPPER: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS: &[u8] = b"0123456789";
const SYMBOLS: &[u8] = b"!@#$%^&*()-_=+[]{}<>?/|~,.";

#[inline]
pub fn generate(
    length: usize,
    upper: bool,
    lower: bool,
    digits: bool,
    symbols: bool,
) -> Result<String, String> {
    if length < MIN_LEN || length > MAX_LEN {
        return Err(format!(
            "La longueur doit être comprise entre {} et {} caractères.",
            MIN_LEN, MAX_LEN
        ));
    }

    let mut categories: Vec<&[u8]> = Vec::new();
    if lower { categories.push(LOWER); }
    if upper { categories.push(UPPER); }
    if digits { categories.push(DIGITS); }
    if symbols { categories.push(SYMBOLS); }

    if categories.is_empty() {
        return Err("Veuillez sélectionner au moins une catégorie de caractères.".to_string());
    }

    let pool: Vec<u8> = categories.iter().flat_map(|s| s.iter().copied()).collect();
    let mut rng = rand::rng();

    // Rejection sampling : distribution uniforme garantie.
    // On génère depuis le pool complet et on recommence si une catégorie manque.
    // En pratique : ~1 tentative pour length >= 8, jamais plus de quelques-unes.
    let mut buf: Vec<u8> = Vec::with_capacity(length);
    loop {
        buf.clear();
        for _ in 0..length {
            buf.push(*pool.choose(&mut rng).unwrap());
        }
        if categories.iter().all(|set| buf.iter().any(|b| set.contains(b))) {
            break;
        }
    }

    // Fisher-Yates shuffle cryptographiquement sécurisé
    buf.shuffle(&mut rng);

    let password = String::from_utf8(buf.clone()).unwrap();

    // Zérisation de la copie intermédiaire en heap
    buf.zeroize();

    Ok(password)
}
