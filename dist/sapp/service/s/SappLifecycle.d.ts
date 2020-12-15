import { ServService, ServAPIArgs, ServAPIRetn } from '../../../service/ServService';
import { SappShowParams as ShowParams, SappHideParams as HideParams } from '../../service/m/SappLifecycle';
export interface SappShowParams extends ShowParams {
    byCreate?: boolean;
}
export interface SappHideParams extends HideParams {
    byClose?: boolean;
}
export declare class SappLifecycle extends ServService {
    onShow(params: ServAPIArgs<SappShowParams>): ServAPIRetn<boolean | void>;
    onHide(params: ServAPIArgs<SappHideParams>): ServAPIRetn<boolean | void>;
    onClose(): ServAPIRetn;
}
