import { ServService, anno, API_UNSUPPORT, ServAPIArgs, ServAPIRetn } from '../../../service/ServService';
import { SappShowParams as ShowParams, SappHideParams as HideParams } from '../../service/m/SappLifecycle';
import { EServConstant } from '../../../common/common';

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

@anno.decl({
    id: '$service.sapp.s.lifecycle',
    version: '1.0.0',
})
export class SappLifecycle extends ServService {
    @anno.decl.api({
        timeout: EServConstant.SAPP_LIFECYCLE_TIMEOUT,
    })
    onShow(params: ServAPIArgs<SappShowParams>): ServAPIRetn<SappOnShowResult | void> {
        return API_UNSUPPORT();
    }
    
    @anno.decl.api({
        timeout: EServConstant.SAPP_LIFECYCLE_TIMEOUT,
    })
    onHide(params: ServAPIArgs<SappHideParams>): ServAPIRetn<SappOnHideResult | void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        timeout: EServConstant.SAPP_LIFECYCLE_TIMEOUT,
    })
    onClose(): ServAPIRetn<SappOnCloseResult | void> {
        return API_UNSUPPORT();
    }
}
