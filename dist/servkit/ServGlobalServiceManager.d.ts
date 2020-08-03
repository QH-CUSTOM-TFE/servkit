import { ServServiceConfig, ServServiceManager } from '../service/ServServiceManager';
export interface ServGlobalServiceConfig extends ServServiceConfig {
}
export declare class ServGlobalServiceManager extends ServServiceManager {
    init(config?: ServGlobalServiceConfig): void;
}
