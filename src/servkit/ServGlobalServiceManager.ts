import { ServServiceConfig, ServServiceManager } from '../service/ServServiceManager';

// tslint:disable-next-line:no-empty-interface
export interface ServGlobalServiceConfig extends ServServiceConfig {
    //
}

export class ServGlobalServiceManager extends ServServiceManager {
    init(config?: ServGlobalServiceConfig) {
        super.init(config);
    }
}
