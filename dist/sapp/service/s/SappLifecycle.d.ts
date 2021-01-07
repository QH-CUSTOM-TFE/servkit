import { ServService, ServAPIArgs, ServAPIRetn } from '../../../service/ServService';
import { SappShowParams as ShowParams, SappHideParams as HideParams } from '../../service/m/SappLifecycle';
export interface SappShowParams extends ShowParams {
    byCreate?: boolean;
}
export interface SappHideParams extends HideParams {
    byClose?: boolean;
}
export interface SappOnShowResult {
    dontShow?: boolean;
}
export interface SappOnHideResult {
    dontHide?: boolean;
}
export interface SappOnCloseResult {
    dontClose?: boolean;
}
export declare class SappLifecycle extends ServService {
    onShow(params: ServAPIArgs<SappShowParams>): ServAPIRetn<SappOnShowResult | void>;
    onHide(params: ServAPIArgs<SappHideParams>): ServAPIRetn<SappOnHideResult | void>;
    onClose(): ServAPIRetn<SappOnCloseResult | void>;
}
