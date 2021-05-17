import { Sapp, SappConfig, ESappLifePolicy } from './Sapp';
import { SappCreateOptions, SappLayoutOptions } from './SappMGR';
import { ServServiceClientConfig } from '../service/ServServiceClient';
import { ServServiceServerConfig } from '../service/ServServiceServer';
import { ServSessionConfig } from '../session/ServSession';
import { SappCloseResult, SappAuthParams } from './service/m/SappLifecycle';
import { EServConstant, asyncThrowMessage } from '../common/common';
import { aspectAfter, aspectBefore } from '../common/aspect';

export abstract class SappController {
    app: Sapp;

    protected cleanHideLifeChecker?: () => void;
    
    constructor(app: Sapp) {
        app.attachController(this);

        aspectBefore(this, 'doShow', this.doShowBeforeAspect);
        aspectAfter(this, 'doHide', this.doHideAfterAspect);
        aspectAfter(this, 'doClose', this.doCloseAfterAspect);
    }

    setLayoutOptions(options: SappCreateOptions['layout'] = {}) {
        if (this.app.isStarted || this.app.start.deferred || this.app.isClosed) {
            asyncThrowMessage('App has started, can\'t set layout');
            return;
        }

        if (typeof options === 'function') {
            options = options(this.app);
        }

        this.resetLayout(options);
    }

    protected abstract resetLayout(options: SappLayoutOptions): void;

    async doConfig(options: SappCreateOptions) {
        const app = this.app;

        this.setLayoutOptions(options.layout);

        const config: SappConfig = {
            beforeStart: async () => {
                return this.beforeStart();
            },
            afterStart: async () => {
                return this.afterStart();
            },
            resolveServiceServerConfig: () => {
                return this.resolveServiceServerConfig(options);
            },
            resolveSessionConfig: () => {
                return this.resolveSessionConfig(options);
            },
        };

        if (options.startTimeout !== undefined) {
            config.startTimeout = options.startTimeout;
        }

        if (options.useTerminalId !== undefined) {
            config.useTerminalId = options.useTerminalId;
        }

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

        if (options.createACLResolver) {
            config.resolveACLResolver = () => {
                return options.createACLResolver!(app);
            };
        }

        app.setConfig(config);
    }

    async doStart() {
        //
    }

    async doAsyncStart() {
        //
    }

    async doCreate() {
        //
    }

    async doShow() {
        //
    }

    async doHide() {
        //
    }

    async doClose(result?: SappCloseResult) {
        //
    }

    async doAuth(params: SappAuthParams) {
        //
    }

    protected async beforeStart() {
        //
    }

    protected async afterStart() {
        //
    }

    protected doHideAfterAspect() {
        const life = this.app.info.options.life;
        if (life !== ESappLifePolicy.AUTO) {
            return;
        }

        if (this.cleanHideLifeChecker) {
            this.cleanHideLifeChecker();
        }

        let maxHideTime = EServConstant.SAPP_HIDE_MAX_TIME;
        if (this.app.info.options.lifeMaxHideTime! > 0) {
            maxHideTime = Math.max(this.app.info.options.lifeMaxHideTime!, EServConstant.SAPP_HIDE_MAX_TIME * 0.5);
        }
        
        let timer: any = setTimeout(() => {
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
            service: options.services ? { services: options.services } : undefined,
            serviceRefer: options.serviceRefer || /.*/,
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
