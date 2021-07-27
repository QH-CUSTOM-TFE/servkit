import { ServService, anno, API_UNSUPPORT, ServAPIRetn } from '../../../service/ServService';
import { EServConstant } from '../../../common/common';

export interface SappHostOnCloseResult {
    dontClose?: boolean;
}

@anno.decl({
    id: '$service.sapp.m.hostPageService',
    version: '1.0.0',
    noVersionCheck: true,
    noRPCCallEvent: true,
})
export class SappHostPageService extends ServService {
    @anno.decl.api({
        timeout: EServConstant.SAPP_LIFECYCLE_TIMEOUT,
    })
    onClose(): ServAPIRetn<SappHostOnCloseResult | void> {
        return API_UNSUPPORT();
    }
}
