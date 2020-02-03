import { getMessageFuction, LocaleData } from "../shared/localize";

declare global {
    interface Window {
        translate: getMessageFuction
        localeData: LocaleData
    }
}