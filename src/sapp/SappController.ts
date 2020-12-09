import { Sapp, SappConfig } from './Sapp';
import { SappCreateOptions, ESappLifePolicy } from './SappMGR';
import { ServServiceClientConfig } from '../service/ServServiceClient';
import { ServServiceServerConfig } from '../service/ServServiceServer';
import { ServSessionConfig } from '../session/ServSession';
import { SappCloseResult } from './service/m/SappLifecycle';
import { aspectAfter, aspectBefore, EServConstant } from '../common/index';

export abstract class SappController {
    app: Sapp;

    protected cleanHideLifeChecker?: () => void;

    constructor(app: Sapp) {
        app.attachController(this);

        aspectBefore(this, 'doShow', this.doShowBeforeAspect);
        aspectAfter(this, 'doHide', this.doHideAfterAspect);
        aspectAfter(this, 'doClose', this.doCloseAfterAspect);
    }

    doConfig(options: SappCreateOptions) {
        const app = this.app;
        const config: SappConfig = {
            resolveServiceServerConfig: () => {
                return this.resolveServiceServerConfig(options);
            },
            resolveSessionConfig: () => {
                return this.resolveSessionConfig(options);
            },
        };

        if (options.startData !== undefined) {
            config.resolveStartData = typeof options.startData === 'function'
                                        ? options.startData
                                        : (() => options.startData);
        }

        if (options.startShowData !== undefined) {
            config.resolveStartShowData = typeof options.startShowData === 'function'
                                        ? options.startShowData
                                        : (() => options.startShowData);
        }

        app.setConfig(config);
    }

    doCreate() {
        //
    }

    doShow() {
        //
    }

    doHide() {
        //
    }

    doClose(result?: SappCloseResult) {
        //
    }

    protected doHideAfterAspect() {
        const life = this.app.info.options.life;
        if (life === ESappLifePolicy.MANUAL) {
            return;
        }

        if (this.cleanHideLifeChecker) {
            this.cleanHideLifeChecker();
        }

        let maxHideTime = EServConstant.SAPP_HIDE_MAX_TIME;
        if (this.app.info.options.lifeMaxHideTime! > 0) {
            maxHideTime = Math.max(this.app.info.options.lifeMaxHideTime!, EServConstant.SAPP_HIDE_MAX_TIME * 0.5);
        }
        
        let timer = setTimeout(() => {
            timer = 0;
            if (this.app) {
                this.app.close({
                    error: new Error('hide_timeout'),
                });
            }
        }, maxHideTime);

        this.cleanHideLifeChecker = () => {
            this.cleanHideLifeChecker = undefined;
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }
        };
    }

    protected doShowBeforeAspect() {
        if (this.cleanHideLifeChecker) {
            this.cleanHideLifeChecker();
        }
    }

    protected doCloseAfterAspect() {
        if (this.cleanHideLifeChecker) {
            this.cleanHideLifeChecker();
        }
    }

    protected resolveServiceClientConfig(options: SappCreateOptions): ServServiceClientConfig {
        return {}; 
    }

    protected resolveServiceServerConfig(options: SappCreateOptions): ServServiceServerConfig {
        return {
            serviceRefer: /.*/,
        };
    }

    protected resolveSessionConfig(options: SappCreateOptions): ServSessionConfig {
        return {
            checkSession: true,
            checkOptions: {
                onBroken: () => {
                    this.onSessionBroken();
                },
            },
            channel: this.resolveSessionChannelConfig(options),
        };
    }

    protected resolveSessionChannelConfig(options: SappCreateOptions): ServSessionConfig['channel'] {
        throw new Error('[SAPPMGR] Unsupport');
    }

    protected onSessionBroken() {
        if (this.app) {
            this.app.close({
                error: new Error('session_broken'),
            });
        }
    }

    onAttach(app: Sapp) {
        if (this.app === app) {
            return false;
        }

        if (this.app && this.app !== app) {
            this.app.detachController();
        }

        this.app = app;

        return true;
    }

    onDetach(app: Sapp) {
        if (this.app !== app) {
            return false;
        }

        this.app = undefined!;
    }
}
