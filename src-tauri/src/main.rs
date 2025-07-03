#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use claxon::FlacReader;
use std::path::PathBuf;
use rand::Rng;

use base64::{engine::general_purpose, Engine};

#[derive(Serialize, Deserialize)]
struct FlacMetadata {
    id: String,
    path: String,
    title: String,
    artist: String,
    album: String,
    duration: f64,
    cover: Option<String>,
}

fn generate_id() -> String {
    rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(10)
        .map(char::from)
        .collect()
}

#[tauri::command]
async fn read_file_base64(path: String) -> Result<String, String> {
    let bytes = std::fs::read(&path).map_err(|e| e.to_string())?;
    let encoded = general_purpose::STANDARD.encode(&bytes);
    Ok(encoded)
}

#[tauri::command]
fn get_flac_metadata(path: String) -> Result<FlacMetadata, String> {
    let path_buf = PathBuf::from(&path);

    let reader = FlacReader::open(&path).map_err(|e| e.to_string())?;
    let streaminfo = reader.streaminfo();

    let mut title = path_buf
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Unknown Title")
        .to_string();

    let mut artist = "Unknown Artist".to_string();
    let mut album = "Unknown Album".to_string();

    for (key, value) in reader.tags() {
        match key {
            "TITLE" => title = value.to_string(),
            "ARTIST" => artist = value.to_string(),
            "ALBUM" => album = value.to_string(),
            _ => {}
        }
    }

    let duration = streaminfo
        .samples
        .map(|s| s as f64 / streaminfo.sample_rate as f64)
        .unwrap_or(0.0);

    let cover = if rand::thread_rng().gen_bool(0.7) {
        Some(format!(
            "https://picsum.photos/300/300?random={}",
            rand::thread_rng().gen::<u32>()
        ))
    } else {
        None
    };

    let id = generate_id();

    Ok(FlacMetadata {
        id,
        path,
        title,
        artist,
        album,
        duration,
        cover,
    })
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init()) // 注册 dialog 插件
        .plugin(tauri_plugin_fs::init()) // 注册 fs 插件
        .invoke_handler(tauri::generate_handler![
            get_flac_metadata,
            read_file_base64
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
