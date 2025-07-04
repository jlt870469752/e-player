//! Main entry point for the FLAC player using Tauri

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use claxon::FlacReader;
use std::path::{Path, PathBuf};
use std::fs;
use rand::Rng;
use base64::{engine::general_purpose, Engine};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Track {
    id: String,
    title: String,
    artist: String,
    album: String,
    duration: f64,
    path: String,
    cover: Option<String>,
}

fn generate_id() -> String {
    rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(10)
        .map(char::from)
        .collect()
}

fn extract_metadata(path: &Path) -> Result<Track, String> {
    let reader = FlacReader::open(path).map_err(|e| e.to_string())?;
    let streaminfo = reader.streaminfo();

    let mut title = path
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

    let cover = if rand::thread_rng().gen_bool(0.5) {
        Some(format!(
            "https://picsum.photos/300/300?random={}",
            rand::thread_rng().gen::<u32>()
        ))
    } else {
        None
    };

    Ok(Track {
        id: generate_id(),
        path: path.to_string_lossy().to_string(),
        title,
        artist,
        album,
        duration,
        cover,
    })
}

#[tauri::command]
fn get_flac_metadata(path: String) -> Result<Track, String> {
    let path_buf = PathBuf::from(path);
    extract_metadata(&path_buf)
}

#[tauri::command]
fn get_flac_metadata1(path: String) -> Result<serde_json::Value, String> {
    let title = std::path::Path::new(&path)
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    Ok(serde_json::json!({
        "id": generate_id(),
        "path": path,
        "title": title,
        "artist": "Unknown",
        "album": "Unknown",
        "duration": 0
    }))
}

#[tauri::command]
fn scan_music_dir() -> Result<Vec<Track>, String> {
    let music_dir = dirs::audio_dir().ok_or("无法获取音乐目录")?;
    let entries = fs::read_dir(&music_dir).map_err(|e| e.to_string())?;

    let mut tracks = vec![];

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("flac") {
            match extract_metadata(&path) {
                Ok(track) => tracks.push(track),
                Err(e) => eprintln!("跳过 {}: {}", path.display(), e),
            }
        }
    }

    Ok(tracks)
}

#[tauri::command]
async fn read_file_base64(path: String) -> Result<String, String> {
    let bytes = std::fs::read(&path).map_err(|e| e.to_string())?;
    let encoded = general_purpose::STANDARD.encode(&bytes);
    Ok(encoded)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_flac_metadata,
            get_flac_metadata1,
            read_file_base64,
            scan_music_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
