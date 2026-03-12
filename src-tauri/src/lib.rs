pub mod password;
mod crack;
mod token;

use serde::Serialize;

#[derive(Serialize)]
struct GenerateResult {
    value: String,
    estimate: crack::CrackEstimate,
}

#[tauri::command]
fn generate_password(
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
fn generate_token(bytes: usize, format: String) -> Result<GenerateResult, String> {
    let value = token::generate(bytes, &format)?;
    // Entropie brute = bytes × 8 bits (indépendant du format d'encodage)
    let estimate = crack::estimate_from_bits(bytes as f64 * 8.0);
    Ok(GenerateResult { value, estimate })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![generate_password, generate_token])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
