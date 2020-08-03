import { servkit } from '../../src/servkit/Servkit';
import { EServChannel } from '../../src/session/channel/ServChannel';
import { ServTerminal, EServTerminal } from '../../src/terminal/ServTerminal';

export const createMasterTerminal = (type: EServChannel) => {
    return servkit.createTerminal({
        id: 'com.servkit.terminal.test',
        type: EServTerminal.MASTER,
            
        session: {
            channel: {
                type,
                config: type === EServChannel.WINDOW ? {
                    master: {
                        createWindow() { return { window }; },
                        destroyWindow() {
                            //
                        },
                    },
                } : undefined,
            },
        },
    });
};

export const createSlaveTerminal = (type: EServChannel) => {
    return servkit.createTerminal({
        id: 'com.servkit.terminal.test',
        type: EServTerminal.SLAVE,
            
        session: {
            channel: {
                type,
            },
        },
    });
};

export const destroyTerminal = (terminal: ServTerminal) => {
    servkit.destroyTerminal(terminal);
};
