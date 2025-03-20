pub fn is_alphanumeric_with_dashes_and_underscores(string: &str) -> bool {
    string
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}
