import { ServService, anno, API_UNSUPPORT, ServAPIRetn, ServAPIArgs } from '../../../service/ServService';

export interface SappShowParams {
    force?: boolean;
    data?: any;
}

export interface SappHideParams {
    force?: boolean;
    data?: any;
}

export interface SappCloseResult {
    data?: any;
    error?: any;
}

@anno.decl({
    id: '$service.sapp.m.lifecycle',
    version: '1.0.0',
})
export class SappLifecycle extends ServService {
    @anno.decl.api()
    onStart(): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    getStartData(): ServAPIRetn<any> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    show(params?: ServAPIArgs<SappShowParams>): ServAPIRetn {
        return API_UNSUPPORT();
    }
    
    @anno.decl.api()
    hide(params?: ServAPIArgs<SappHideParams>): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    close(result?: ServAPIArgs<SappCloseResult>): ServAPIRetn {
        return API_UNSUPPORT();
    }
}
