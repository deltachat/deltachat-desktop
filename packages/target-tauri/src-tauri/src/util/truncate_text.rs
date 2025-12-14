pub(crate) fn truncate_text(text: &str, max_len: usize) -> String {
    let truncated: String = text.chars().take(max_len).collect();
    if truncated.len() < text.len() {
        format!("{truncated}…")
    } else {
        truncated
    }
}
