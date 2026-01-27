#![deny(clippy::indexing_slicing, clippy::correctness)]
#![warn(
    unused,
    clippy::all,
    clippy::wildcard_imports,
    clippy::needless_borrow,
    clippy::cast_lossless,
    clippy::unused_async,
    clippy::explicit_iter_loop,
    clippy::explicit_into_iter_loop,
    clippy::cloned_instead_of_copied
)]

use std::collections::HashMap;

use intl_pluralrules::{PluralCategory, PluralRuleType, PluralRules, operands::PluralOperands};
use log::error;
use regex::{self, Regex};
use unic_langid::{LanguageIdentifier, LanguageIdentifierError};

#[derive(Debug)]
pub enum Substitution<'a> {
    None,
    String(Vec<&'a str>),
    Quantity(usize),
    QuantityFloat(f32),
    QuantityAndString(usize, Vec<&'a str>),
    QuantityFloatAndString(f32, Vec<&'a str>),
}

pub struct TranslationEngine {
    messages: HashMap<String, HashMap<String, String>>,
    plural_rules: PluralRules,
    var_finder_positional: Regex,
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("language id malformed")]
    LangIdMalformed,
    #[error("parsing of lang id failed {0:?}")]
    LangIdParsingFailed(LanguageIdentifierError),
    #[error("Plural rule not found {0}")]
    PluralRuleNotFound(&'static str),
    #[error("Invalid RegEx Pattern")]
    RegEx(#[from] regex::Error),
}

impl TranslationEngine {
    pub fn new(
        messages: HashMap<String, HashMap<String, String>>,
        langid: &str,
    ) -> Result<Self, Error> {
        let langid: LanguageIdentifier = langid
            .split("_")
            .next()
            .ok_or(Error::LangIdMalformed)?
            .parse()
            .map_err(Error::LangIdParsingFailed)?;
        let pr = PluralRules::create(langid, PluralRuleType::CARDINAL)
            .map_err(Error::PluralRuleNotFound)?;
        let var_finder_positional = Regex::new(r"%\d\$[\w\d]")?;

        Ok(TranslationEngine {
            messages,
            plural_rules: pr,
            var_finder_positional,
        })
    }

    fn substitute_strings(&self, key: &str, message: &str, items: Vec<&str>) -> String {
        let mut msg: String = message.to_owned();
        let mut has_positional_replacement = false;
        let mut replacement_happened = false;
        for matches in self.var_finder_positional.find_iter(message) {
            has_positional_replacement = true;
            let from = matches.as_str();
            let Some(position) = from.chars().nth(1).and_then(|from| from.to_digit(10)) else {
                error!("Invalid format of replacement pattern");
                return key.to_owned();
            };
            if let Some(item) = items.get(position as usize - 1) {
                msg = msg.replace(from, item);
            } else {
                error!("Invalid item position {position}");
                return key.to_owned();
            }
            replacement_happened = true;
        }
        // Assumptions:
        // - `%s` instead of positional `%1$s` is only used when message only contains one placeholder.
        // - `%s` and `%1$s` placeholders are never mixed.
        if !has_positional_replacement && msg.contains("%s") {
            if let Some(item) = items.first() {
                msg = msg.replace("%s", item);
            } else {
                error!("no substitution item provided");
                return key.to_owned();
            }
            replacement_happened = true;
        }
        if !replacement_happened {
            error!("invalid translation string: {key}, no placeholders for substitution found");
            return key.to_owned();
        }

        msg
    }

    fn quantity_to_plural_key<N>(&self, quantity: N) -> Result<&'static str, &'static str>
    where
        N: TryInto<PluralOperands>,
    {
        let plural_key = match self.plural_rules.select(quantity) {
            Ok(PluralCategory::ZERO) => "zero",
            Ok(PluralCategory::ONE) => "one",
            Ok(PluralCategory::TWO) => "two",
            Ok(PluralCategory::FEW) => "few",
            Ok(PluralCategory::MANY) => "many",
            Ok(PluralCategory::OTHER) => "other",
            Err(err) => return Err(err),
        };
        Ok(plural_key)
    }

    pub fn translate(&self, key: &str, substitution: Substitution) -> String {
        let Some(entry) = self.messages.get(key) else {
            error!("Translation for key {key} missing");
            return key.to_owned();
        };
        match substitution {
            Substitution::None => {
                if let Some(message) = entry.get("message") {
                    message.to_owned()
                } else {
                    error!("Message not existing for {key}");
                    key.to_owned()
                }
            }
            Substitution::String(items) => {
                let Some(message) = entry.get("message") else {
                    error!("Message not existing for {key}");
                    return key.to_owned();
                };
                self.substitute_strings(key, message, items)
            }
            Substitution::QuantityFloat(..)
            | Substitution::Quantity(..)
            | Substitution::QuantityFloatAndString(..)
            | Substitution::QuantityAndString(..) => {
                let (quantity_key_result, quantity_string) = match substitution {
                    Substitution::QuantityFloat(quantity_float)
                    | Substitution::QuantityFloatAndString(quantity_float, ..) => (
                        self.quantity_to_plural_key(quantity_float),
                        quantity_float.to_string(),
                    ),
                    Substitution::Quantity(quantity)
                    | Substitution::QuantityAndString(quantity, ..) => {
                        (self.quantity_to_plural_key(quantity), quantity.to_string())
                    }
                    _ => unreachable!(),
                };

                let quantity_key = match quantity_key_result {
                    Ok(key) => key,
                    Err(err) => {
                        error!("Failed to convert {quantity_string}: {err}");
                        return key.to_owned();
                    }
                };
                if let Some(message) = entry.get(quantity_key) {
                    let msg = message
                        .replace("%1$d", &quantity_string)
                        .replace("%d", &quantity_string);

                    if let Some(items) = match substitution {
                        Substitution::QuantityFloatAndString(.., items)
                        | Substitution::QuantityAndString(.., items) => Some(items),
                        _ => None,
                    } {
                        self.substitute_strings(key, &msg, items)
                    } else {
                        msg
                    }
                } else {
                    error!(
                        "Message for key was found {key}, but variant {quantity_key} to represent quantity of {quantity_string} is missing"
                    );
                    key.to_owned()
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn no_substitutions() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({"qrshow_title": {
              "message": "QR-Einladungscode"
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "de").unwrap();
        let result = txen.translate("qrshow_title", Substitution::None);
        assert_eq!(result, "QR-Einladungscode");
    }

    #[test]
    fn one_substitution() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({ "default_value": {
              "message": "Standard (%1$s)"
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "de").unwrap();
        let result = txen.translate("default_value", Substitution::String(vec!["Turbo"]));
        assert_eq!(result, "Standard (Turbo)");
    }

    #[test]
    fn two_substitutions() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({"n_messages_in_m_chats": {
                    "message": "%1$d Nachrichten in %2$d Chats"
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "de").unwrap();
        let result = txen.translate(
            "n_messages_in_m_chats",
            Substitution::String(vec!["2", "-1"]),
        );
        assert_eq!(result, "2 Nachrichten in -1 Chats");
    }

    #[test]
    fn three_substitutions() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({"aeap_addr_changed": {
              "message": "%1$s hat die E-Mail-Adresse von %2$s nach %3$s geändert"
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "de").unwrap();
        let result = txen.translate(
            "aeap_addr_changed",
            Substitution::String(vec![
                "Max Mustermann",
                "max@mustermann.de",
                "mustermann@max.de",
            ]),
        );
        assert_eq!(
            result,
            "Max Mustermann hat die E-Mail-Adresse von max@mustermann.de nach mustermann@max.de geändert"
        );
    }

    #[test]
    fn three_substitutions_scrambled() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({"group_name_changed_by_other": {
              "message": "%3$s已将群组名称从“%1$s”更改为“%2$s”"
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "zh_CN").unwrap();
        let result = txen.translate(
            "group_name_changed_by_other",
            Substitution::String(vec!["1", "2", "3"]),
        );
        assert_eq!(result, "3已将群组名称从“1”更改为“2”");
    }

    #[test]
    fn four_substitutions() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({"aeap_addr_changed": {
              "message": "%1$s hat die E-Mail-Adresse von %2$s nach %3$s geändert und %4$s"
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "de").unwrap();
        let result = txen.translate(
            "aeap_addr_changed",
            Substitution::String(vec![
                "Max Mustermann",
                "max@mustermann.de",
                "mustermann@max.de",
                "ist toll",
            ]),
        );
        assert_eq!(
            result,
            "Max Mustermann hat die E-Mail-Adresse von max@mustermann.de nach mustermann@max.de geändert und ist toll"
        );
    }

    #[test]
    fn quantity_ru() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({ "n_minutes": {
              "one": "%d минуту",
              "few": "%d минуты",
              "many": "%d минут",
              "other": "%d минут"
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "ru").unwrap();
        let result = txen.translate("n_minutes", Substitution::Quantity(1));
        assert_eq!(result, "1 минуту");

        let result = txen.translate("n_minutes", Substitution::Quantity(2));
        assert_eq!(result, "2 минуты");

        let result = txen.translate("n_minutes", Substitution::Quantity(5));
        assert_eq!(result, "5 минут");

        let result = txen.translate("n_minutes", Substitution::QuantityFloat(1.5));
        assert_eq!(result, "1.5 минут");
    }

    #[test]
    fn quantity_en() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({ "n_hours": {
              "one": "%d hour",
              "other": "%d hours"
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "en").unwrap();
        let result = txen.translate("n_hours", Substitution::Quantity(1));
        assert_eq!(result, "1 hour");

        let result = txen.translate("n_hours", Substitution::Quantity(2));
        assert_eq!(result, "2 hours");
    }

    #[test]
    fn quantity_key_missing() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({ "n_hours": {
                "faulty": "",
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "en").unwrap();
        let result = txen.translate("n_hours", Substitution::Quantity(1));
        assert_eq!(result, "n_hours");
    }

    #[test]
    fn no_translation_for_key() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({})).unwrap();
        let txen = TranslationEngine::new(msgs, "de").unwrap();
        let result = txen.translate("qrshow_title", Substitution::None);
        assert_eq!(result, "qrshow_title");
    }

    #[test]
    fn no_message_for_key() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({"qrshow_title": {
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "de").unwrap();
        let result = txen.translate("qrshow_title", Substitution::None);
        assert_eq!(result, "qrshow_title");
    }

    #[test]
    fn substitution_position_doesnt_exist() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({"group_name_changed_by_other": {
              "message": "%2$s”"
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "zh_CN").unwrap();
        let result = txen.translate(
            "group_name_changed_by_other",
            Substitution::String(vec!["1"]),
        );
        assert_eq!(result, "group_name_changed_by_other");
    }

    #[test]
    fn invalid_substitution_matching_pattern() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({"group_name_changed_by_other": {
              "message": "$s”"
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "zh_CN").unwrap();
        let result = txen.translate(
            "group_name_changed_by_other",
            Substitution::String(vec!["1"]),
        );
        assert_eq!(result, "group_name_changed_by_other");
    }
    // TODO: tests: that errors do not crash the program and are returned as errors instead (creation of translation engine)

    #[test]
    fn plural_and_substitution() {
        let msgs: HashMap<String, HashMap<String, String>> =
            serde_json::from_value(serde_json::json!({"ask_send_following_n_files_to": {
              "one": "Send the following file to %s?",
              "other": "Send the following %d files to %s?"
            }}))
            .unwrap();
        let txen = TranslationEngine::new(msgs, "en").unwrap();
        let result = txen.translate(
            "ask_send_following_n_files_to",
            Substitution::QuantityAndString(1, vec!["Alice"]),
        );
        assert_eq!(result, "Send the following file to Alice?");

        let result = txen.translate(
            "ask_send_following_n_files_to",
            Substitution::QuantityFloatAndString(5.5, vec!["Bob"]),
        );
        assert_eq!(result, "Send the following 5.5 files to Bob?");
    }
}
