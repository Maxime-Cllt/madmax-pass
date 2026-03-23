use crate::analysis;
use crate::crack;
use crate::models::GenerateResult;
use crate::password;
use crate::token;

#[tauri::command]
pub fn generate_password(
    length: usize,
    upper: bool,
    lower: bool,
    digits: bool,
    symbols: bool,
) -> Result<GenerateResult, String> {
    let value = password::generate(length, upper, lower, digits, symbols)?;
    let estimate = crack::estimate(length, upper, lower, digits, symbols);
    Ok(GenerateResult { value, estimate })
}

#[tauri::command]
pub fn generate_token(bytes: usize, format: String) -> Result<GenerateResult, String> {
    let value = token::generate(bytes, &format)?;
    // Entropie brute = bytes × 8 bits (indépendant du format d'encodage)
    let estimate = crack::estimate_from_bits(bytes as f64 * 8.0);
    Ok(GenerateResult { value, estimate })
}

#[tauri::command]
pub fn analyze_password(password: String) -> crate::models::AnalyzeResult {
    analysis::analyze_password(&password)
}
