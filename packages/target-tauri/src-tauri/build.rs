use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    let source_date_epoch = std::env::var("SOURCE_DATE_EPOCH").unwrap_or("".to_owned());
    let build_time_stamp = if !source_date_epoch.is_empty() {
        source_date_epoch
            .parse::<u128>()
            .expect("unable to parse SOURCE_DATE_EPOCH")
            * 1000
    } else {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_millis()
    };

    println!("cargo:rustc-env=BUILD_TIME_STAMP={build_time_stamp}");
    println!("cargo:rustc-env=BUILD_INFO_GIT={}", get_git_ref());

    tauri_build::build()
}

fn gather_process_stdout(command: &str, args: &[&str]) -> Result<String, String> {
    let output = std::process::Command::new(command)
        .args(args)
        .output()
        .map_err(|err| err.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err("Command failed to execute".to_string())
    }
}

fn get_git_ref() -> String {
    if let Ok(git_ref) = std::env::var("VERSION_INFO_GIT_REF") {
        return git_ref;
    }

    let git_describe = gather_process_stdout("git", &["describe"])
        .expect("git describe failed;Hint: you could also set VERSION_INFO_GIT_REF manually");
    let git_branch;

    if let Ok(git_symbolic_ref) =
        std::env::var("GITHUB_HEAD_REF").or_else(|_| std::env::var("GITHUB_REF"))
    {
        git_branch = git_symbolic_ref
            .split('/')
            .last()
            .unwrap_or("main")
            .to_string();
        println!("{} {}", git_symbolic_ref, git_branch);
    } else {
        git_branch = gather_process_stdout("git", &["symbolic-ref", "HEAD"])
            .map(|r| r.split('/').last().unwrap_or("main").to_owned())
            .unwrap_or("main".to_owned())
            .to_string();
    }

    if git_branch == "main" {
        git_describe
    } else {
        format!("{}-{}", git_describe, git_branch)
    }
}
