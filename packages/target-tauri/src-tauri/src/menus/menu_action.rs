use tauri::{menu::MenuId, AppHandle};

pub trait MenuAction<'a>: TryFrom<&'a MenuId> + Into<MenuId> {
    fn execute(self, app: &AppHandle) -> anyhow::Result<()>;
}

macro_rules! impl_menu_conversion {
    ($enum_name:ident) => {
        impl TryFrom<&tauri::menu::MenuId> for $enum_name {
            type Error = anyhow::Error;

            fn try_from(item: &tauri::menu::MenuId) -> Result<Self, Self::Error> {
                use std::str::FromStr;
                Self::from_str(item.as_ref()).map_err(|e| e.into())
            }
        }

        impl From<$enum_name> for tauri::menu::MenuId {
            fn from(action: $enum_name) -> Self {
                tauri::menu::MenuId::new(action)
            }
        }
    };
}
pub(super) use impl_menu_conversion;
