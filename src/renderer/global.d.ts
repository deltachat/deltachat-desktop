import { getMessageFuction } from "../shared/localize";

declare global {
    interface Window {
        translate: getMessageFuction
    }
}