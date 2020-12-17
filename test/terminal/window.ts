import { servkit } from '../../src/servkit/Servkit';
import { EServChannel } from '../../src/session/channel/ServChannel';
import { EServTerminal } from '../../src/terminal/ServTerminal';
import { Test } from '../service/decl/service';
import { TestImpl } from '../service/impl/service';
import { ACLResolver } from '../util';

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

    const slave = servkit.createTerminal({
        id: 'com.session.window.test',
        type: EServTerminal.SLAVE,

        session: {
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
        },
    });

    return { master, slave, destroy: () => {
        servkit.destroyTerminal(slave);
        servkit.destroyTerminal(master);
        document.body.removeChild(dom);
    } };
};
