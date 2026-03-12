mod password;

use crate::password::PasswordGenerator;

#[tauri::command]
fn generate_password(length: usize) -> Result<String, String> {
    let mut generator = PasswordGenerator::new();
    generator.generate(length)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![generate_password])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
