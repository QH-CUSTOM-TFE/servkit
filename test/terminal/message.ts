import { Test1, Test } from '../service/decl/service';
import { Test1Impl, TestImpl } from '../service/impl/service';
import { servkit } from '../../src/servkit/Servkit';
import { EServTerminal } from '../../src/terminal/ServTerminal';
import { EServChannel } from '../../src/session/channel/ServChannel';
import { ACLResolver } from '../util';

export const createTerminal = () => {
    const master = servkit.createTerminal({
        id: 'com.session.message.test',
        type: EServTerminal.MASTER,
            
        server: {
            service: {
                services: [
                    { decl: Test, impl: TestImpl},                
                ],
            },
            serviceRefer: /.*/,
            ACLResolver: new ACLResolver(),
        },
        session: {
            channel: {
                type: EServChannel.MESSAGE,
            },
        },
    });

    const slave = servkit.createTerminal({
        id: 'com.session.message.test',
        type: EServTerminal.SLAVE,
            
        session: {
            channel: {
                type: EServChannel.MESSAGE,
            },
        },
    });

    return { master, slave, destroy: () => {
        servkit.destroyTerminal(slave);
        servkit.destroyTerminal(master);
    } };
};
