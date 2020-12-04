import { servkit } from '../../src/servkit/Servkit';
import { EServChannel } from '../../src/session/channel/ServChannel';
import { EServTerminal, ServTerminal } from '../../src/terminal/ServTerminal';
import { Test } from '../service/decl/service';
import { TestImpl } from '../service/impl/service';
import { ACLResolver } from '../util';
import { sappSDK } from '../../src/sapp/SappSDK';

export const createTerminal = () => {
    const dom = window.document.createElement('iframe');
    document.body.appendChild(dom);
    const domWindow = dom.contentWindow;
    
    const master = servkit.createTerminal({
        id: 'com.session.window.test',
        type: EServTerminal.MASTER,
        server: {
            service: {
                services: [
                    { decl: Test, impl: TestImpl },
                ],
            },
            serviceRefer: /.*/,
            ACLResolver: new ACLResolver(),
        },
        session: {
            channel: {
                type: EServChannel.WINDOW,
                config: {
                    master: {
                        createWindow() {
                            return {
                                target: domWindow,
                                window,
                            };
                        },
                        destroyWindow(windowInfo) {
                            return;
                        },
                    },
                },
            },
        },
    });

    sappSDK.setConfig({
        resolveStartParams(sdk) {
            return {
                id: 'com.session.window.test',
            };
        },
        resolveSessionConfig(sdk) {
            return {
                channel: {
                    type: EServChannel.WINDOW,
                    config: {
                        slave: {
                            getWindow(channel) {
                                return {
                                    target: window,
                                    window: domWindow,
                                };
                            },
                        },
                    },
                },
            };
        },
    });

    return { master, slave: {
        get session() {
            return sappSDK.terminal.session;
        },
        get server() {
            return sappSDK.terminal.server;
        },
        openSession: () => sappSDK.start(),
        client: sappSDK,
        closeSession: () => sappSDK.destroy(),
    } as any as ServTerminal, destroy: () => {
        sappSDK.destroy();
        servkit.destroyTerminal(master);
        document.body.removeChild(dom);
    } };
};
