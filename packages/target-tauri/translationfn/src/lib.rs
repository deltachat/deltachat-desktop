use std::collections::HashMap;

use intl_pluralrules::{PluralCategory, PluralRuleType, PluralRules};
use log::error;
use regex::{self, Regex};
use unic_langid::{LanguageIdentifier, LanguageIdentifierError};

pub enum Substitution<'a> {
    None,
    String(Vec<&'a str>),
    Quantity(usize),
    QuantityFloat(f32),
}

pub struct TranslationEngine {
    messages: HashMap<String, HashMap<String, String>>,
    plural_rules: PluralRules,
    var_finder: Regex,
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
        let var_finder = Regex::new(r"%\d\$[\w\d]")?;

        Ok(TranslationEngine {
            messages,
            plural_rules: pr,
            var_finder,
        })
    }
    pub fn translate(&self, key: &str, substitution: Substitution) -> String {
        if let Some(entry) = self.messages.get(key) {
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
                    if let Some(message) = entry.get("message") {
                        let mut msg = message.clone();
                        for matches in self.var_finder.find_iter(message) {
                            let from = matches.as_str();
                            if let Some(position) =
                                from.chars().nth(1).and_then(|from| from.to_digit(10))
                            {
                                if let Some(item) = items.get(position as usize - 1) {
                                    msg = msg.replace(from, item);
                                } else {
                                    error!("Invalid item position {position}");
                                    return key.to_owned();
                                }
                            } else {
                                error!("Invalid format of replacement pattern");
                                return key.to_owned();
                            }
                        }
                        msg
                    } else {
                        error!("Message not existing for {key}");
                        key.to_owned()
                    }
                }
                Substitution::Quantity(quantity) => {
                    let quantity_key = match self.plural_rules.select(quantity) {
                        Ok(PluralCategory::ZERO) => "zero",
                        Ok(PluralCategory::ONE) => "one",
                        Ok(PluralCategory::TWO) => "two",
                        Ok(PluralCategory::FEW) => "few",
                        Ok(PluralCategory::MANY) => "many",
                        Ok(PluralCategory::OTHER) => "other",
                        Err(_) => {
                            error!("Failed to  {quantity}");
                            return key.to_owned();
                        }
                    };
                    if let Some(message) = entry.get(quantity_key) {
                        let quantity_string = quantity.to_string();
                        message
                            .replace("%1$d", &quantity_string)
                            .replace("%d", &quantity_string)
                    } else {
                        error!(
                            "Message for key was found {key}, but variant {quantity_key} to represent quantity of {quantity} is missing"
                        );
                        key.to_owned()
                    }
                }
                Substitution::QuantityFloat(quantity_float) => {
                    let quantity_key = match self.plural_rules.select(quantity_float) {
                        Ok(PluralCategory::ZERO) => "zero",
                        Ok(PluralCategory::ONE) => "one",
                        Ok(PluralCategory::TWO) => "two",
                        Ok(PluralCategory::FEW) => "few",
                        Ok(PluralCategory::MANY) => "many",
                        Ok(PluralCategory::OTHER) => "other",
                        Err(_) => {
                            error!("Failed to  {quantity_float}");
                            return key.to_owned();
                        }
                    };
                    if let Some(message) = entry.get(quantity_key) {
                        message.replace("%d", &quantity_float.to_string())
                    } else {
                        error!(
                            "Message for key was found {key}, but variant {quantity_key} to represent quantity of {quantity_float} is missing"
                        );
                        key.to_owned()
                    }
                }
            }
        } else {
            error!("Translation for key {key} missing");
            key.to_owned()
        }
    }
}

pub fn add(left: u64, right: u64) -> u64 {
    left + right
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
    // TODO: handle %s case for substitution pattern matching
}
