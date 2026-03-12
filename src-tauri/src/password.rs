use rand::seq::SliceRandom;
use rand::{rngs::OsRng, Rng};

const MIN_LEN: usize = 16;
const MAX_LEN: usize = 4096;

const LOWER: &str = "abcdefghijklmnopqrstuvwxyz";
const UPPER: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS: &str = "0123456789";
const SYMBOLS: &str = "!@#$%^&*()-_=+[]{}<>?/|~,.";

pub struct PasswordGenerator {
    rng: OsRng,
}

impl PasswordGenerator {
    pub fn new() -> Self {
        Self { rng: OsRng }
    }

    pub fn generate(&mut self, length: usize) -> Result<String, String> {
        if length < MIN_LEN || length > MAX_LEN {
            return Err(format!(
                "La longueur doit etre comprise entre {} et {} caracteres.",
                MIN_LEN, MAX_LEN
            ));
        }

        let mut chars: Vec<char> = Vec::with_capacity(length);
        let categories = [LOWER, UPPER, DIGITS, SYMBOLS];

        for set in categories {
            chars.push(self.random_char(set));
        }

        let all = [LOWER, UPPER, DIGITS, SYMBOLS].concat();
        for _ in chars.len()..length {
            chars.push(self.random_char(&all));
        }

        chars.shuffle(&mut self.rng);
        Ok(chars.iter().collect())
    }

    fn random_char(&mut self, set: &str) -> char {
        let bytes = set.as_bytes();
        let idx = self.rng.gen_range(0..bytes.len());
        bytes[idx] as char
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn has_lowercase(value: &str) -> bool {
        value.chars().any(|c| c.is_ascii_lowercase())
    }

    fn has_uppercase(value: &str) -> bool {
        value.chars().any(|c| c.is_ascii_uppercase())
    }

    fn has_digit(value: &str) -> bool {
        value.chars().any(|c| c.is_ascii_digit())
    }

    fn has_symbol(value: &str) -> bool {
        value.chars().any(|c| SYMBOLS.contains(c))
    }

    #[test]
    fn generates_password_with_expected_length_and_categories() {
        let mut generator = PasswordGenerator::new();
        let value = generator.generate(64).expect("generation should succeed");

        assert_eq!(value.len(), 64);
        assert!(has_lowercase(&value));
        assert!(has_uppercase(&value));
        assert!(has_digit(&value));
        assert!(has_symbol(&value));
    }

    #[test]
    fn rejects_length_below_min() {
        let mut generator = PasswordGenerator::new();
        let err = generator.generate(MIN_LEN - 1).expect_err("should fail");
        assert!(err.contains("longueur"));
    }

    #[test]
    fn rejects_length_above_max() {
        let mut generator = PasswordGenerator::new();
        let err = generator.generate(MAX_LEN + 1).expect_err("should fail");
        assert!(err.contains("longueur"));
    }

    #[test]
    fn accepts_min_and_max_lengths() {
        let mut generator = PasswordGenerator::new();
        let min_value = generator.generate(MIN_LEN).expect("min length ok");
        let max_value = generator.generate(MAX_LEN).expect("max length ok");

        assert_eq!(min_value.len(), MIN_LEN);
        assert_eq!(max_value.len(), MAX_LEN);
    }
}
