import { ServTerminal, ServTerminalConfig, EServTerminal } from '../terminal/ServTerminal';
import { ServServiceServerConfig } from '../service/ServServiceServer';
import { parseQueryParams, createDeferred, Deferred } from '../common/index';
import { EServChannel } from '../session/channel/ServChannel';
import { servkit, Servkit } from '../servkit/Servkit';
import { ServService } from '../service/ServService';
import { ServServiceClientConfig } from '../service/ServServiceClient';
import { ServSessionConfig } from '../session/ServSession';

/**
 * SappSDK启动参数
 */
export interface SappStartParams {
    id?: string;
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
     * SappSDK.start() 前置回调
     * @param sdk 
     */
    beforeStart?(sdk: SappSDK): Promise<void>;

    /**
     * SappSDK启动参数的构造回调；
     * 优先使用SappStartOptions.params，其次SappSDKConfig.resolveStartParams，默认使用parseQueryParams；
     * parseQueryParams将会从window.location.href中解析query参数
     * @param sdk 
     */
    resolveStartParams?(sdk: SappSDK): Promise<SappStartParams> | SappStartParams;

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
}

/**
 * SappSDK start参数项
 */
export interface SappStartOptions {
    params?: SappStartParams | SappSDKConfig['resolveStartParams'];
}

/**
 * SappSDK是为Servkit应用提供的一个SDK
 */
export class SappSDK {
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

    protected config: SappSDKConfig;
    protected starting?: Deferred;

    constructor() {
        this.started = createDeferred();
        this.setConfig({
            // Default Config
        });
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
     * 启动SDK
     *
     * @param {SappStartOptions} [options]
     * @returns {Promise<void>}
     * @memberof SappSDK
     */
    async start(options?: SappStartOptions): Promise<void> {
        if (this.isStarted) {
            return;
        }

        if (this.starting) {
            return this.starting;
        }

        const config = this.config;
        if (!config) {
            throw new Error('[SAPPSDK] Config must be set before setup');
        }
        
        const starting = createDeferred();
        this.starting = starting;

        try {
            options = options || {};
            
            if (config.beforeStart) {
                await config.beforeStart(this);
            }

            // Setup terminal config
            let resolveParams: SappSDKConfig['resolveStartParams'] = undefined!;
            if (options.params) {
                resolveParams = 
                    typeof options.params === 'function' 
                    ? options.params 
                    : (() => options!.params as SappStartParams) ;
            } else {
                resolveParams = config.resolveStartParams || parseQueryParams;
            }
            
            const params = await resolveParams(this);
            let terminalConfig: ServTerminalConfig = {
                id: params.id || '',
                type: EServTerminal.SLAVE,
                session: undefined!,
            };

            if (config.resolveServiceClientConfig) {
                terminalConfig.client = await config.resolveServiceClientConfig(this);
            }
    
            if (config.resolveServiceServerConfig) {
                terminalConfig.server = await config.resolveServiceServerConfig(this);
            }

            if (config.resolveSessionConfig) {
                terminalConfig.session = await config.resolveSessionConfig(this);
            } else {
                terminalConfig.session = {
                    channel: {
                        type: EServChannel.WINDOW,
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
    
            // Check config validation
            if (!terminalConfig.id || !terminalConfig.session) {
                throw new Error('[SAPPSDK] Invalid terminal config');
            }
    
            // Setup terminal
            this.terminal = (config.servkit || servkit).createTerminal(terminalConfig);
            await this.terminal.openSession();

            // TODO
            // App validation check

            // TODO
            // Setup common service in sdk
            this.isStarted = true;
            
            if (config.afterStart) {
                await config.afterStart(this);
            }

            starting.resolve();
            this.started.resolve();
        } catch (e) {
            if (this.terminal) {
                this.terminal.servkit.destroyTerminal(this.terminal);
            }
            this.terminal = undefined!;
            this.isStarted = false;

            starting.reject();
            this.started.reject();
        }
        
        this.starting = undefined;
    }

    /**
     * 销毁SDK，该方法主要用于CI测试（建议业务不要使用，因为SappSDK生命周期通常与应用程序的生命周期保一致）
     */
    async destroy() {
        if (!this.isStarted) {
            return;
        }

        this.isStarted = false;
        this.starting = undefined;
        this.started = createDeferred();

        if (this.terminal) {
            this.terminal.servkit.destroyTerminal(this.terminal);
            this.terminal = undefined!;
        }
    }

    /**
     * 根据服务声明获取服务对象
     *
     * @template T
     * @param {T} decl
     * @returns {(InstanceType<T> | undefined)}
     * @memberof SappSDK
     */
    getService<T extends typeof ServService>(decl: T): InstanceType<T> | undefined;
    getService<M extends { [key: string]: typeof ServService }>(decls: M)
        : { [key in keyof M]: InstanceType<M[key]> | undefined };
    getService() {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.client.getService(arguments[0]);
    }

    /**
     * 根据服务声明获取服务对象；非安全版本，在类型上任务返回的所有服务对象都是存在的，但实际可能并不存在（值为undefined）
     *
     * @template T
     * @param {T} decl
     * @returns {InstanceType<T>}
     * @memberof SappSDK
     */
    getServiceUnsafe<T extends typeof ServService>(decl: T): InstanceType<T>;
    getServiceUnsafe<M extends { [key: string]: typeof ServService }>(decls: M)
        : { [key in keyof M]: InstanceType<M[key]> };
    getServiceUnsafe() {
        return this.getService.apply(this, arguments);
    }

    /**
     * 根据服务声明获取服务对象，返回一个Promise；如果某个服务不存在，Promise将reject。
     *
     * @template T
     * @param {T} decl
     * @returns {Promise<InstanceType<T>>}
     * @memberof SappSDK
     */
    service<T extends typeof ServService>(decl: T): Promise<InstanceType<T>>;
    service<M extends { [key: string]: typeof ServService }>(decls: M)
        : Promise<{ [key in keyof M]: InstanceType<M[key]> }>;
    service() {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SAPPSDK] SappSDK is not started'));
        }

        return this.terminal.client.service.apply(this.terminal.client, arguments);
    }

    /**
     * 根据服务声明获取服务对象，通过回调方式接收服务对象；如果某个服务不存在，回调得不到调用。
     *
     * @template T
     * @template R
     * @param {T} decl
     * @param {((service: InstanceType<T>) => R)} exec
     * @memberof SappSDK
     */
    serviceExec<
        T extends typeof ServService,
        R>(
        decl: T,
        exec: ((service: InstanceType<T>) => R));
    serviceExec<
        M extends { [key: string]: typeof ServService },
        R>(
        decls: M,
        exec: ((services: { [key in keyof M]: InstanceType<M[key]> }) => R));
    serviceExec() {
        if (!this.isStarted) {
            return null;
        }

        return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
    }
}

export const sappSDK = new SappSDK();
