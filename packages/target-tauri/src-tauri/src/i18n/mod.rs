use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub mod commands;
mod load;

// preperation for RTL pr : https://github.com/deltachat/deltachat-desktop/pull/4168/files#diff-3b1f1ef99e1e3ea3c7a50a48159dbc1c11b582f5af7b8cf9daf1548fdc04c894
#[derive(Default, Serialize, Deserialize, Debug, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum LocaleWritingDirection {
    #[default]
    Ltr,
    Rtl,
}

#[derive(Default, Serialize)]
pub struct LocaleData {
    locale: String,
    dir: LocaleWritingDirection,
    messages: HashMap<String, HashMap<String, String>>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum Language {
    String(String),
    Object {
        name: String,
        dir: LocaleWritingDirection,
    },
}
