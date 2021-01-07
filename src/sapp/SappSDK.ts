import { ServTerminal, ServTerminalConfig, EServTerminal } from '../terminal/ServTerminal';
import { ServServiceServerConfig, ServServiceServer } from '../service/ServServiceServer';
import { asyncThrow, asyncThrowMessage } from '../common/common';
import { parseServQueryParams } from '../common/query';
import { EServChannel } from '../session/channel/ServChannel';
import { servkit, Servkit } from '../servkit/Servkit';
import { anno, ServAPIArgs, ServAPIRetn } from '../service/ServService';
import { ServServiceClientConfig, ServServiceClient } from '../service/ServServiceClient';
import { ServSessionConfig } from '../session/ServSession';
import { 
    SappLifecycle,
    SappShowParams,
    SappHideParams,
    SappOnShowResult,
    SappOnHideResult,
    SappOnCloseResult,
} from './service/s/SappLifecycle';
import { 
    SappLifecycle as Lifecycle,
    SappShowParams as ShowParams,
    SappHideParams as HideParams,
    SappAuthParams as AuthParams,
} from './service/m/SappLifecycle';
import { Deferred, DeferredUtil } from '../common/Deferred';
import { SappSDKMock, SappSDKMockConfig } from './SappSDKMock';
import { getAsyncLoadStartParams, putAsyncLoadDeclContext } from '../common/sharedParams';
import { ESappType } from './Sapp';
import { ServServiceConfig, ServServiceReferPattern } from '../service/ServServiceManager';
import { EventEmitter } from 'eventemitter3';

/**
 * SappSDK启动参数
 */
export interface SappSDKStartParams {
    uuid?: string;
}

export enum ESappSDKLifeCycleEvent {
    BEFORE_START = 'BEFORE_START',
    ON_CREATE = 'ON_CREATE',
    ON_SHOW = 'ON_SHOW',
    ON_HIDE = 'ON_HIDE',
    ON_CLOSE = 'ON_CLOSE',
    AFTER_START = 'AFTER_START',
}

export interface SappSDKAsyncLoadStartParams extends SappSDKStartParams {
    container?: HTMLElement;
}

export interface SappSDKAsyncLoadDeclParams {
    bootstrap: (sdk: SappAsyncLoadSDK) => void;
    deBootstrap?: (sdk: SappAsyncLoadSDK) => void;
}

export interface SappSDKAsyncLoadDeclContext {
    bootstrap: () => void;
    deBootstrap: () => void;
}

/**
 * SappSDK配置
 */
export interface SappSDKConfig {
    /**
     * SappSDK底层Servkit，默认使用全局的servkit
     */
    servkit?: Servkit;

    /**
     * 通信的terminal id；SappSDK仍然采用的是ServTerminal作为双端通信，该双端通信基于一个id进行匹配
     *
     * @type {string}
     * @memberof SappSDKConfig
     */
    useTerminalId?: string;

    /**
     * SappSDK权限认证信息
     *
     * @memberof SappSDKConfig
     */
    authInfo?: AuthParams | ((sdk: SappSDK) => AuthParams | Promise<AuthParams>);

    /**
     * SappSDK.start() 前置回调
     * @param sdk 
     */
    beforeStart?(sdk: SappSDK): Promise<void>;

    /**
     * SappSDK启动参数的构造回调；
     * 优先使用SappSDKStartOptions.params，其次SappSDKConfig.resolveStartParams，默认使用parseQueryParams；
     * parseQueryParams将会从window.location.href中解析query参数
     * @param sdk 
     */
    resolveStartParams?(sdk: SappSDK): Promise<SappSDKStartParams> | SappSDKStartParams;

    /**
     * ServiceServerConfig的构造回调
     * @param sdk 
     */
    resolveServiceServerConfig?(sdk: SappSDK): Promise<ServServiceServerConfig> | ServServiceServerConfig;
    
    /**
     * ServiceClientConfig的构造回调
     * @param sdk 
     */
    resolveServiceClientConfig?(sdk: SappSDK): Promise<ServServiceClientConfig> | ServServiceClientConfig;

    /**
     * SessionConfig的构造回调
     * @param sdk 
     */
    resolveSessionConfig?(sdk: SappSDK): Promise<ServSessionConfig> | ServSessionConfig;

    /**
     * 在SappSDK中使用ServTerminal作为服务通信的桥接，ServTerminalConfig会通过该回调做最终的config调整
     * @param sdk 
     * @param config 
     */
    resolveTerminalConfig?(sdk: SappSDK, config: ServTerminalConfig)
        : Promise<ServTerminalConfig> | ServTerminalConfig | void;
    
    /**
     * SappSDK.start() 后置回调
     * @param sdk 
     */
    afterStart?(sdk: SappSDK): Promise<void>;

    /**
     * 生命周期回调，应用创建时回调
     *
     * @param {SappSDK} sdk
     * @returns {Promise<void>}
     * @memberof SappSDKConfig
     */
    onCreate?(sdk: SappSDK, params: SappSDKStartParams, data?: any): Promise<void>;

    /**
     * 生命周期回调，应用显示时回调
     *
     * @param {SappSDK} sdk
     * @returns {Promise<SappOnShowResult | void>}
     * @memberof SappSDKConfig
     */
    onShow?(sdk: SappSDK, params: SappShowParams): Promise<SappOnShowResult | void> | void;
    
    /**
     * 生命周期回调，应用隐藏时回调
     *
     * @param {SappSDK} sdk
     * @returns {Promise<SappOnHideResult | void>}
     * @memberof SappSDKConfig
     */
    onHide?(sdk: SappSDK, params: SappHideParams): Promise<SappOnHideResult | void> | void;

    /**
     * 生命周期回调，应用关闭时回调
     *
     * @param {SappSDK} sdk
     * @returns {Promise<SappOnCloseResult | void>}
     * @memberof SappSDKConfig
     */
    onClose?(sdk: SappSDK): Promise<SappOnCloseResult | void> | void;

    /**
     * SappSDK的mock配置，通过该配置，SappSDK应用可脱离主应用调试开发；
     * 通过window.__$servkit.enableSappSDKMock()或者链接添加__SAPPSDK_MOCK_ENABLE__打开开关才能生效；
     *
     * @type {SappSDKMockConfig}
     * @memberof SappSDKConfig
     */
    mock?: SappSDKMockConfig;

    services?: ServServiceConfig['services'];

    serviceRefer?: ServServiceReferPattern;
}

/**
 * SappSDK start参数项
 */
export interface SappSDKStartOptions {
    params?: SappSDKStartParams | SappSDKConfig['resolveStartParams'];
}

/**
 * SappSDK是为Servkit应用提供的一个SDK
 */
export class SappSDK extends EventEmitter {
    /**
     * SDK是否已经初始化
     *
     * @type {boolean}
     * @memberof SappSDK
     */
    isStarted: boolean;

    /**
     * SDK start deffered Promise；在业务层面可以使用sappSDK.started去等待SDK的初始化（也可以直接使用SappSDK.start()这种形式）
     *
     * @type {Deferred}
     * @memberof SappSDK
     */
    started: Deferred;

    /**
     * 内部服务通信桥梁，建议不要直接使用
     *
     * @type {ServTerminal}
     * @memberof SappSDK
     */
    terminal: ServTerminal;

    /**
     *
     *
     * @type {SappSDKMock}
     * @memberof SappSDK
     */
    sdkMock: SappSDKMock;

    protected config: SappSDKConfig;

    constructor() {
        super();

        this.started = DeferredUtil.create();
        this.setConfig({
            // Default Config
        });

        if (SappSDKMock.isMockEnabled()) {
            this.sdkMock = new SappSDKMock(this);
            // tslint:disable-next-line:no-console
            console.warn(
                '[SAPPSDK]\n\nNOTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\nSAPPSDK MOCK FEATURE ENABLED.\n',
            );
        }
    }

    /**
     * SappSDK的全局配置，需要在start之前设定好
     *
     * @param {SappSDKConfig} config
     * @returns this
     * @memberof SappSDK
     */
    setConfig(config: SappSDKConfig) {
        this.config = config;

        return this;
    }

    /**
     * 获取全局配置
     *
     * @returns
     * @memberof SappSDK
     */
    getConfig() {
        return this.config;
    }

    /**
     * 获取SappSDK使用的servkit
     *
     * @returns
     * @memberof SappSDK
     */
    getServkit() {
        return this.config.servkit || servkit;
    }

    /**
     * 启动SDK
     *
     * @param {SappSDKStartOptions} [options]
     * @returns {Promise<void>}
     * @memberof SappSDK
     */
    start = DeferredUtil.reEntryGuard(async (options?: SappSDKStartOptions): Promise<void> => {
        if (this.isStarted) {
            return;
        }

        const config = this.config;
        if (!config) {
            throw new Error('[SAPPSDK] Config must be set before setup');
        }
        
        try {
            options = options || {};

            if (this.sdkMock) {
                if (config.mock) {
                    this.sdkMock.setConfig(config.mock);
                }
                
                await this.sdkMock.start();
            }
            
            await this.beforeStart(options);

            const params = await this.resolveStartParams(options);
            
            await this.beforeInitTerminal();
            await this.initTerminal(options, params);
            await this.afterInitTerminal();

            await this.initSDK();

            this.isStarted = true;

            const data = await this.service(Lifecycle).then((service) => {
                return service.getStartData();
            }).catch((error) => {
                asyncThrow(error);
                asyncThrow(new Error('[SAPPSDK] Can\'t get start datas from SAPP'));
            });

            await this.onCreate(params, data);
            
            await this.afterStart();

            this.started.resolve();

            this.service(Lifecycle).then((service) => {
                return service.onStart();
            }).catch((error) => {
                asyncThrow(error);
                asyncThrow(new Error('[SAPPSDK] Can\'t notify onStart to SAPP'));
            });
        } catch (e) {
            this.onStartFailed();

            this.isStarted = false;
            this.started.reject(e);

            throw e;
        }
    });

    async show(params?: ShowParams) {
        return this.service(Lifecycle).then((service) => {
            return service.show(params);
        });
    }

    async hide(params?: HideParams) {
        return this.service(Lifecycle).then((service) => {
            return service.hide(params);
        });
    }

    async close() {
        return this.service(Lifecycle).then((service) => {
            return service.close();
        });
    }

    /**
     * 获取service
     *
     * @type {ServServiceClient['getService']}
     * @memberof SappSDK
     */
    getService: ServServiceClient['getService'] = function(this: SappSDK) {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.client.getService(arguments[0]);
    };

    /**
     * 获取service；返回类型没有保证service一定存在，但类型上没有做强制处理，因此为unsafe形式
     *
     * @type {ServServiceClient['getServiceUnsafe']}
     * @memberof SappSDK
     */
    getServiceUnsafe: ServServiceClient['getServiceUnsafe'] = function(this: SappSDK) {
        return this.getService.apply(this, arguments);
    };

    /**
     * 获取service，promise形式；如果某个service不存在，promise将reject
     *
     * @type {ServServiceClient['service']}
     * @memberof SappSDK
     */
    service: ServServiceClient['service'] = function(this: SappSDK) {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SAPPSDK] SappSDK is not started'));
        }

        return this.terminal.client.service.apply(this.terminal.client, arguments);
    };

    /**
     * 获取service，callback形式；如果某个service不存在，callback将得不到调用
     *
     * @type {ServServiceClient['serviceExec']}
     * @memberof SappSDK
     */
    serviceExec: ServServiceClient['serviceExec'] = function(this: SappSDK) {
        if (!this.isStarted) {
            return null;
        }

        return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
    };

    /**
     * 获取server提供的service
     *
     * @type {ServServiceServer['getService']}
     * @memberof SappSDK
     */
    getServerService: ServServiceServer['getService'] = function(this: SappSDK) {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.server.getService(arguments[0]);
    };

    /**
     * 获取server提供的service；返回类型没有保证service一定存在，但类型上没有做强制处理，因此为unsafe形式
     *
     * @type {ServServiceServer['getServiceUnsafe']}
     * @memberof SappSDK
     */
    getServerServiceUnsafe: ServServiceServer['getServiceUnsafe'] = function(this: SappSDK) {
        return this.getServerService.apply(this, arguments);
    };

    /**
     * 获取server提供的service，promise形式；如果某个service不存在，promise将reject
     *
     * @type {ServServiceServer['service']}
     * @memberof SappSDK
     */
    serverService: ServServiceServer['service'] = function(this: SappSDK) {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SAPPSDK] SappSDK is not started'));
        }

        return this.terminal.server.service.apply(this.terminal.server, arguments);
    };

    /**
     * 获取server提供的service，callback形式；如果某个service不存在，callback将得不到调用
     *
     * @type {ServServiceServer['serviceExec']}
     * @memberof SappSDK
     */
    serverServiceExec: ServServiceServer['serviceExec'] = function(this: SappSDK) {
        if (!this.isStarted) {
            return null;
        }

        return this.terminal.server.serviceExec.apply(this.terminal.server, arguments);
    };

    protected async beforeStart(options: SappSDKStartOptions): Promise<void> {
        if (this.config.beforeStart) {
            await this.config.beforeStart(this);
        }

        this.emit(ESappSDKLifeCycleEvent.BEFORE_START, this);
    }

    protected async afterStart(): Promise<void> {
        this.emit(ESappSDKLifeCycleEvent.AFTER_START, this);
        
        if (this.config.afterStart) {
            await this.config.afterStart(this);
        }
    }

    protected onStartFailed() {
        if (this.terminal) {
            this.terminal.servkit.destroyTerminal(this.terminal);
        }
        this.terminal = undefined!;
    }

    protected async resolveStartParams(options: SappSDKStartOptions): Promise<SappSDKStartParams> {
        let resolveParams: SappSDKConfig['resolveStartParams'] = undefined!;
        if (options.params) {
            resolveParams = 
                typeof options.params === 'function' 
                ? options.params 
                : (() => options.params! as SappSDKStartParams) ;
        } else {
            resolveParams = this.config.resolveStartParams;
        }

        if (resolveParams) {
            const params = await resolveParams(this);
            return params || {};
        } else {
            return this.getDefaultStartParams() || {};
        }
    }

    protected async beforeInitTerminal(): Promise<void> {
        //
    }

    protected async initTerminal(options: SappSDKStartOptions, params: SappSDKStartParams): Promise<void> {
        const config = this.config;

        const terminalId = config.useTerminalId || params.uuid || '';

        let terminalConfig: ServTerminalConfig = {
            id: terminalId,
            type: EServTerminal.SLAVE,
            session: undefined!,
        };

        if (config.resolveServiceClientConfig) {
            terminalConfig.client = await config.resolveServiceClientConfig(this);
        }

        // Service server config
        {
            if (config.resolveServiceServerConfig) {
                terminalConfig.server = await config.resolveServiceServerConfig(this);
            }

            if (!terminalConfig.server) {
                terminalConfig.server = {};
            }

            let services = config.services;
            if (services && terminalConfig.server.service && terminalConfig.server.service.services) {
                services = services.concat(terminalConfig.server.service.services);
            }
            if (services) {
                const service = terminalConfig.server.service || {};
                service.services = services;
                terminalConfig.server.service = service;
            }

            if (config.serviceRefer) {
                terminalConfig.server.serviceRefer = config.serviceRefer;
            }

            if (!terminalConfig.server.serviceRefer) {
                terminalConfig.server.serviceRefer = /.*/;
            }
        }

        if (config.resolveSessionConfig) {
            terminalConfig.session = await config.resolveSessionConfig(this);
        } else {
            terminalConfig.session = {
                channel: {
                    type: this.getAppType() === ESappType.ASYNC_LOAD ? EServChannel.EVENT_LOADER :  EServChannel.WINDOW,
                },
            };
        }

        if (config.resolveTerminalConfig) {
            const newTerminalConfig = await config.resolveTerminalConfig(this, terminalConfig);
            if (newTerminalConfig) {
                terminalConfig = newTerminalConfig;
            }
        }

        // Rewrite type
        terminalConfig.type = EServTerminal.SLAVE;
        terminalConfig.session.checkSession = true;

        if (this.sdkMock) {
            this.sdkMock.fixSlaveTerminalConfig(terminalConfig);
        }

        // Check config validation
        if (!terminalConfig.id || !terminalConfig.session) {
            throw new Error('[SAPPSDK] Invalid terminal config');
        }

        // Setup terminal
        this.terminal = this.getServkit().createTerminal(terminalConfig);

        // Setup lifecycle
        const self = this;
        const SappLifecycleImpl = class extends SappLifecycle {
            onShow(p: ServAPIArgs<SappShowParams>): ServAPIRetn<SappOnShowResult | void> {
                return self.onShow(p);
            }
            
            onHide(p: ServAPIArgs<SappHideParams>): ServAPIRetn<SappOnHideResult | void> {
                return self.onHide(p);
            }

            onClose(): ServAPIRetn<SappOnCloseResult | void> {
                return self.onClose();
            }
        };
        anno.impl()(SappLifecycleImpl);

        this.terminal.server.addServices([{
            decl: SappLifecycle,
            impl: SappLifecycleImpl,
        }], {
            lazy: true,
        });

        await this.terminal.openSession();

        // Do auth check
        try {
            let authInfo: AuthParams;
            if (this.config.authInfo) {
                authInfo = typeof this.config.authInfo === 'function'
                            ? (await this.config.authInfo(this))
                            : this.config.authInfo;
            } else {
                authInfo = {
                    token: '',
                };
            }
            const service = await this.terminal.client.service(Lifecycle);
            await service.auth(authInfo);
        } catch (e) {
            asyncThrowMessage('[SappSDK] Auth failed');
            throw e;
        }
    }

    protected async afterInitTerminal(): Promise<void> {
        //
    }

    protected async initSDK(): Promise<void> {
        // TODO
        // Setup common service in sdk
    }

    protected async initSDKMock() {
        //
    }

    protected async onCreate(params: SappSDKStartParams, data: any) {
        if (this.config.onCreate) {
            await this.config.onCreate(this, params, data);
        }

        this.emit(ESappSDKLifeCycleEvent.ON_CREATE, this, params, data);
    }

    protected async onShow(params: SappShowParams) {
        let ret: SappOnShowResult | void;
        if (this.config.onShow) {
            ret = await this.config.onShow(this, params);
        }

        this.emit(ESappSDKLifeCycleEvent.ON_SHOW, this, params);

        return ret;
    }

    protected async onHide(params: SappHideParams) {
        let ret: SappOnHideResult | void;
        if (this.config.onHide) {
            ret = await this.config.onHide(this, params);
        }

        this.emit(ESappSDKLifeCycleEvent.ON_HIDE, this, params);

        return ret;
    }

    protected async onClose() {
        this.emit(ESappSDKLifeCycleEvent.ON_CLOSE, this);

        if (this.config.onClose) {
            return await this.config.onClose(this);
        }
    }

    getAppType(): ESappType {
        return ESappType.IFRAME;
    }

    getDefaultStartParams(): SappSDKStartParams | undefined {
        return parseServQueryParams();
    }

    static declAsyncLoad(appId: string, params: SappSDKAsyncLoadDeclParams) {
        let sdk: SappAsyncLoadSDK = undefined!;

        const bootstrap = () => {
            if (sdk) {
                asyncThrow(new Error(`[SAPPSDK] sdk is invalid for async load app ${appId} on bootstrap`));
            }
            sdk = new SappAsyncLoadSDK(appId);
            params.bootstrap(sdk);
        };

        const deBootstrap = () => {
            sdk = undefined!;
        };

        putAsyncLoadDeclContext(appId, {
            bootstrap,
            deBootstrap,
        });

        try {
            if (SappSDKMock.isMockEnabled()) {
                SappSDKMock.tryAsynLoadBootstrap(appId);
            }
        } catch (e) {
            //
        }
    }
}

export class SappAsyncLoadSDK extends SappSDK {
    protected appId: string;
    
    constructor(appId: string) {
        super();
        this.appId = appId;
    }

    getAppId() {
        return this.appId;
    }

    getAppType(): ESappType {
        return ESappType.ASYNC_LOAD;
    }

    getDefaultStartParams() {
        return getAsyncLoadStartParams(this.appId);
    }
}

let sInstance: SappSDK = undefined!;
try {
sInstance = new SappSDK();
} catch (e) {
    asyncThrow(e);
}

export const sappSDK = sInstance;
