use actix_web::{web, App, HttpServer, HttpResponse};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, Duration};
use regex::Regex;
use log::{info, warn, debug};
use std::collections::HashMap;
use serde_json::json;
use reqwest::Client;
use dotenvy::dotenv;


#[derive(Debug, Serialize, Deserialize)]
struct LogEntry {
    timestamp: DateTime<Utc>,
    level: String,
    message: String,
    metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
struct LogAnalysis {
    total_entries: usize,
    by_level: HashMap<String, usize>,
    error_rate: f64,
    patterns: Vec<Pattern>,
    time_series: Vec<TimePoint>,
    anomalies: Vec<Anomaly>,
    processing_time: Duration,
}

#[derive(Debug, Serialize)]
struct Pattern {
    pattern: String,
    occurrences: usize,
    examples: Vec<String>,
}

#[derive(Debug, Serialize)]
struct TimePoint {
    timestamp: DateTime<Utc>,
    count: usize,
    error_count: usize,
}

#[derive(Debug, Serialize)]
struct Anomaly {
    timestamp: DateTime<Utc>,
    metric: String,
    value: f64,
    threshold: f64,
}

#[derive(Debug, Serialize)]
struct LogStats {
    processed: usize,
    errors: usize,
    start_time: DateTime<Utc>,
}

static mut STATS: Option<LogStats> = None;

async fn analyze_logs(logs: web::Json<Vec<LogEntry>>) -> HttpResponse {
    let start_time = Utc::now();
    info!("Starting log analysis for {} entries", logs.len());

    let mut analysis = LogAnalysis {
        total_entries: logs.len(),
        by_level: HashMap::new(),
        error_rate: 0.0,
        patterns: Vec::new(),
        time_series: Vec::new(),
        anomalies: Vec::new(),
        processing_time: Duration::seconds(0),
    };

    for log in logs.iter() {
        *analysis.by_level.entry(log.level.clone()).or_insert(0) += 1;
    }

    let error_count = analysis.by_level.get("ERROR").unwrap_or(&0);
    if analysis.total_entries > 0 {
        analysis.error_rate = *error_count as f64 / analysis.total_entries as f64;
    }

    analysis.patterns = detect_patterns(&logs);
    debug!("Found {} patterns", analysis.patterns.len());

    analysis.time_series = generate_time_series(&logs);
    debug!("Generated {} time points", analysis.time_series.len());

    analysis.anomalies = detect_anomalies(&analysis.time_series);
    if !analysis.anomalies.is_empty() {
        warn!("Detected {} anomalies", analysis.anomalies.len());
    }

    unsafe {
        STATS = Some(LogStats {
            processed: logs.len(),
            errors: *error_count,
            start_time,
        });
    }

    analysis.processing_time = Utc::now().signed_duration_since(start_time);
    info!("Analysis complete in {:?}", analysis.processing_time);

    HttpResponse::Ok().json(analysis)
}

fn detect_patterns(logs: &[LogEntry]) -> Vec<Pattern> {
    let patterns = vec![
        Regex::new(r"failed to connect").unwrap(),
        Regex::new(r"timeout").unwrap(),
        Regex::new(r"exception").unwrap(),
        Regex::new(r"error code \d+").unwrap(),
        Regex::new(r"invalid (request|response)").unwrap(),
    ];

    patterns.into_iter()
        .filter_map(|pattern| {
            let matches: Vec<_> = logs.iter()
                .filter(|log| pattern.is_match(&log.message))
                .map(|log| log.message.clone())
                .collect();

            if !matches.is_empty() {
                Some(Pattern {
                    pattern: pattern.to_string(),
                    occurrences: matches.len(),
                    examples: matches.into_iter().take(3).collect(),
                })
            } else {
                None
            }
        })
        .collect()
}

fn generate_time_series(logs: &[LogEntry]) -> Vec<TimePoint> {
    let mut time_series = Vec::new();
    
    if let (Some(first), Some(last)) = (
        logs.iter().map(|l| l.timestamp).min(),
        logs.iter().map(|l| l.timestamp).max()
    ) {
        let window = Duration::hours(1);
        let mut current = first;

        while current <= last {
            let next = current + window;
            let window_logs: Vec<_> = logs.iter()
                .filter(|l| l.timestamp >= current && l.timestamp < next)
                .collect();

            let error_count = window_logs.iter()
                .filter(|l| l.level == "ERROR")
                .count();

            time_series.push(TimePoint {
                timestamp: current,
                count: window_logs.len(),
                error_count,
            });

            current = next;
        }
    }

    time_series
}

fn detect_anomalies(time_series: &[TimePoint]) -> Vec<Anomaly> {
    let mut anomalies = Vec::new();
    
    if time_series.is_empty() {
        return anomalies;
    }

    let counts: Vec<f64> = time_series.iter().map(|tp| tp.count as f64).collect();
    let mean = counts.iter().sum::<f64>() / counts.len() as f64;
    let variance = counts.iter()
        .map(|&count| (count - mean).powi(2))
        .sum::<f64>() / counts.len() as f64;
    let std_dev = variance.sqrt();
    let threshold = mean + 2.0 * std_dev;

    for point in time_series {
        if point.count as f64 > threshold {
            anomalies.push(Anomaly {
                timestamp: point.timestamp,
                metric: "log_volume".to_string(),
                value: point.count as f64,
                threshold,
            });
        }
        let error_rate = if point.count > 0 {
            point.error_count as f64 / point.count as f64
        } else {
            0.0
        };

        if error_rate > 0.2 {
            anomalies.push(Anomaly {
                timestamp: point.timestamp,
                metric: "error_rate".to_string(),
                value: error_rate,
                threshold: 0.2,
            });
        }
    }

    anomalies
}

async fn get_stats() -> HttpResponse {
    let stats = unsafe { STATS.as_ref() };
    match stats {
        Some(s) => HttpResponse::Ok().json(s),
        None => HttpResponse::NotFound().finish()
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();
            
        App::new()
            .wrap(cors)
            .service(
                web::scope("/api")
                    .route("/analyze", web::post().to(analyze_logs))
                    .route("/analyze/ai", web::post().to(analyze_with_ai))
            )
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

async fn analyze_with_ai(logs: web::Json<Vec<LogEntry>>) -> HttpResponse {
    
    let api_key = std::env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY not set");
    let client = Client::new();

    let logs_text = logs.iter()
        .map(|log| format!("{} [{}] {}", log.timestamp, log.level, log.message))
        .collect::<Vec<_>>()
        .join("\n");

    let body = json!({
        "contents": [{
            "parts": [{
                "text": format!("Analyze these logs and provide insights about:\n1. Error patterns\n2. System health\n3. Recommendations\n\nLogs:\n {}", logs_text)
            }]
        }]
    });

    match client
        .post("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent")
        .query(&[("key", api_key)])
        .json(&body)
        .send()
        .await {
            Ok(response) => match response.json::<serde_json::Value>().await {
                Ok(json) => HttpResponse::Ok().json(json!({ 
                    "analysis": json["candidates"][0]["content"]["parts"][0]["text"].as_str().unwrap_or("Analysis failed")
                })),
                Err(_) => HttpResponse::InternalServerError().json(json!({ "error": "Failed to parse response" }))
            },
            Err(_) => HttpResponse::InternalServerError().json(json!({ "error": "Failed to reach Gemini API" }))
        }
}