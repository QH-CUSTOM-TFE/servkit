import { ServService, anno, API_UNSUPPORT, ServAPIRetn, ServAPIArgs } from '../../../service/ServService';
import { EServConstant } from '../../../common/common';

export interface SappShowParams {
    force?: boolean;
    data?: any;
}

export interface SappHideParams {
    force?: boolean;
    data?: any;
}

export interface SappAuthParams {
    token: string;
    [property: string]: any;
}

export interface SappCloseResult {
    data?: any;
    error?: any;
}

@anno.decl({
    id: '$service.sapp.m.lifecycle',
    version: '1.0.0',
    noVersionCheck: true,
    noRPCCallEvent: true,
})
export class SappLifecycle extends ServService {
    @anno.decl.api()
    auth(params: SappAuthParams): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    onStart(): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    getStartData(): ServAPIRetn<any> {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        timeout: EServConstant.SAPP_LIFECYCLE_TIMEOUT,
    })
    show(params?: ServAPIArgs<SappShowParams>): ServAPIRetn<boolean> {
        return API_UNSUPPORT();
    }
    
    @anno.decl.api({
        timeout: EServConstant.SAPP_LIFECYCLE_TIMEOUT,
    })
    hide(params?: ServAPIArgs<SappHideParams>): ServAPIRetn<boolean> {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        timeout: EServConstant.SAPP_LIFECYCLE_TIMEOUT,
    })
    close(result?: ServAPIArgs<SappCloseResult>): ServAPIRetn<boolean> {
        return API_UNSUPPORT();
    }
}
