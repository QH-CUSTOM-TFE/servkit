import { ServService, anno, API_UNSUPPORT, ServAPIArgs, ServAPIRetn } from '../../../service/ServService';
import { EServConstant } from '../../../common/common';

export interface SappHostInfo {
    id: string;
    token: string;
    [property: string]: any;
}

@anno.decl({
    id: '$service.sapp.s.hostPageService',
    version: '1.0.0',
    noVersionCheck: true,
    noRPCCallEvent: true,
})
export class SappHostPageService extends ServService {
    @anno.decl.api({
        timeout: -1,
    })
    getHostInfo(): ServAPIRetn<SappHostInfo> {
        return API_UNSUPPORT();
    }
    
    @anno.decl.api()
    getHostData(params?: ServAPIArgs<any>): ServAPIRetn<any> {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        timeout: EServConstant.SAPP_LIFECYCLE_TIMEOUT,
    })
    close(): ServAPIRetn<boolean> {
        return API_UNSUPPORT();
    }
}
