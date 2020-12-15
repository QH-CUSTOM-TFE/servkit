import { ServService, anno, API_UNSUPPORT, ServAPIArgs, ServAPIRetn } from '../../../service/ServService';
import { SappShowParams as ShowParams, SappHideParams as HideParams } from '../../service/m/SappLifecycle';

export interface SappShowParams extends ShowParams {
    byCreate?: boolean;
}

export interface SappHideParams extends HideParams {
    byClose?: boolean;
}

@anno.decl({
    id: '$service.sapp.s.lifecycle',
    version: '1.0.0',
})
export class SappLifecycle extends ServService {
    @anno.decl.api()
    onShow(params: ServAPIArgs<SappShowParams>): ServAPIRetn<boolean | void> {
        return API_UNSUPPORT();
    }
    
    @anno.decl.api()
    onHide(params: ServAPIArgs<SappHideParams>): ServAPIRetn<boolean | void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    onClose(): ServAPIRetn {
        return API_UNSUPPORT();
    }
}
