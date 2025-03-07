use std::collections::HashMap;

use tauri::utils::config::Csp;

/// Adds custom windows and android variant of custom schemes,
///
/// But only on windows and android, to prevent access to localhost on the other platforms.
///
/// Schemes are different on those 2 platforms `custom:` becomes `http://custom.localhost`.
pub fn add_custom_schemes_to_csp_for_window(csp: Csp, is_https: bool) -> Csp {
    let mut map: HashMap<_, _> = csp.into();
    for (key, value) in map.iter_mut() {
        let sources: Vec<String> = value.to_owned().into();
        let mut custom_schemes = Vec::with_capacity(sources.len());
        for source in &sources {
            if source.ends_with(':') && source != "blob:" && source != "data:" {
                custom_schemes.push(source.clone());
            }
            if source.ends_with(".localhost") {
                panic!("invalid source found in key {key}: {source} - localhost sources for windows are added automatically and only on window");
            }
        }
        // println!("custom_schemes: {key}: {custom_schemes:?}");
        #[cfg(any(debug_assertions, target_os = "windows", target_os = "android"))]
        {
            let custom_sources = custom_schemes
                .iter()
                .map(|s| {
                    format!(
                        "{}://{}.localhost",
                        if is_https { "https" } else { "http" },
                        s.strip_suffix(':').unwrap()
                    )
                })
                .collect();

            value.extend(custom_sources);
        }
    }

    map.into()
}
