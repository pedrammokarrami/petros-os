fn main() {
    let logs = vec![
        "INFO: Server started successfully",
        "ERROR: Database connection timeout",
        "WARN: High CPU utilization detected",
    ];
    let errors: Vec<&&str> = logs.iter().filter(|log| log.contains("ERROR")).collect();
    println!("Found {0} error logs", errors.len());
}