import { ServService, ServAPIArgs, ServAPIRetn } from '../../../service/ServService';
import { SappShowParams as ShowParams, SappHideParams as HideParams } from '../../service/m/SappLifecycle';
export interface SappShowParams extends ShowParams {
    byCreate?: boolean;
}
export interface SappHideParams extends HideParams {
    byClose?: boolean;
}
export declare class SappLifecycle extends ServService {
    onShow(params: ServAPIArgs<SappShowParams>): ServAPIRetn<boolean>;
    onHide(params: ServAPIArgs<SappHideParams>): ServAPIRetn<boolean>;
    onClose(): ServAPIRetn;
}
