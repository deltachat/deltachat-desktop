/// Returns true if host string contains non ASCII characters
pub(super) fn is_puny(host: &str) -> bool {
    for ch in host.chars() {
        if !(ch.is_ascii_alphanumeric() || matches!(ch, '.' | '-')) {
            return true;
        }
    }
    false
}

/// Returns host as punycode encoded string
pub(super) fn puny_code_encode_host(host: &str) -> String {
    host.split('.')
        .map(|sub| {
            if is_puny(sub) {
                format!(
                    "xn--{}",
                    unic_idna_punycode::encode_str(sub)
                        .unwrap_or_else(|| "[punycode encode failed]".to_owned())
                )
            } else {
                sub.to_owned()
            }
        })
        .collect::<Vec<String>>()
        .join(".")
}

/// Returns host as decoded string
pub(super) fn puny_code_decode_host(host: &str) -> String {
    host.split('.')
        .map(|sub| {
            if let Some(sub) = sub.strip_prefix("xn--") {
                unic_idna_punycode::decode_to_string(sub)
                    .unwrap_or_else(|| "[punycode decode failed]".to_owned())
            } else {
                sub.to_owned()
            }
        })
        .collect::<Vec<String>>()
        .join(".")
}
