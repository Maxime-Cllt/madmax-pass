pub mod password;
mod analysis;
mod commands;
mod crack;
mod models;
mod token;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::generate_password,
            commands::generate_token,
            commands::analyze_password
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
