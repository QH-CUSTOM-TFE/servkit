import { Sapp } from './Sapp';
import { SappCreateOptions } from './SappMGR';
import { ServServiceClientConfig } from '../service/ServServiceClient';
import { ServServiceServerConfig } from '../service/ServServiceServer';
import { ServSessionConfig } from '../session/ServSession';
import { SappCloseResult } from './service/m/SappLifecycle';
export declare abstract class SappController {
    app: Sapp;
    protected cleanHideLifeChecker?: () => void;
    constructor(app: Sapp);
    doConfig(options: SappCreateOptions): void;
    doCreate(): void;
    doShow(): void;
    doHide(): void;
    doClose(result?: SappCloseResult): void;
    protected doHideAfterAspect(): void;
    protected doShowBeforeAspect(): void;
    protected doCloseAfterAspect(): void;
    protected resolveServiceClientConfig(options: SappCreateOptions): ServServiceClientConfig;
    protected resolveServiceServerConfig(options: SappCreateOptions): ServServiceServerConfig;
    protected resolveSessionConfig(options: SappCreateOptions): ServSessionConfig;
    protected resolveSessionChannelConfig(options: SappCreateOptions): ServSessionConfig['channel'];
    protected onSessionBroken(): void;
    onAttach(app: Sapp): boolean;
    onDetach(app: Sapp): false | undefined;
}
