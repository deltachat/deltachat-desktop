pub trait StrExt {
    fn is_ascii_alphanumeric_with_dashes_and_underscores(&self) -> bool;
}

impl StrExt for str {
    fn is_ascii_alphanumeric_with_dashes_and_underscores(&self) -> bool {
        self.chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
    }
}
