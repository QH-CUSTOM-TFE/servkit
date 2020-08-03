import { servkit } from '../../src/servkit/Servkit';
import { EServChannel } from '../../src/session/channel/ServChannel';
import { Test, Test1 } from '../service/decl/service';
import { TestImpl, Test1Impl } from '../service/impl/service';
import { EServTerminal } from '../../src/terminal/ServTerminal';

export const createTerminal = () => {
    const master = servkit.createTerminal({
        id: 'com.session.event.test',
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
                type: EServChannel.EVENT,
            },
        },
    });

    const slave = servkit.createTerminal({
        id: 'com.session.event.test',
        type: EServTerminal.SLAVE,
        session: {
            channel: {
                type: EServChannel.EVENT,
            },
        },
    });

    return { master, slave, destroy: () => {
        servkit.destroyTerminal(slave);
        servkit.destroyTerminal(master);
    } };
};
