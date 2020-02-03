import { getMessageFunction, LocaleData } from "../shared/localize";

declare global {
    interface Window {
        translate: getMessageFunction
        localeData: LocaleData
    }
}