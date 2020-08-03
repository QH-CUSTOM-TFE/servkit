import { servkit } from '../../src/servkit/Servkit';
import { EServChannel } from '../../src/session/channel/ServChannel';
import { EServTerminal } from '../../src/terminal/ServTerminal';
import { Test, Test1 } from '../service/decl/service';
import { TestImpl, Test1Impl } from '../service/impl/service';

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
