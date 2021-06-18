import { ServServiceConfig } from '../service';
import { servkit } from '../servkit';
import { EServChannel, ServChanleWindowData, ServWindowChannel } from '../session';
import { EServTerminal } from '../terminal';
import { EServIFrameShowPolicy, IFrameUtil } from '../window';

export interface ICreateOptions {
    terminalId: string;

    services: ServServiceConfig['services'];

    url: string;

    container?: any;
}

export class SappHelper {
    static async create(option: ICreateOptions) {
        const terminal = servkit.createTerminal({
            id: option.terminalId,
            type: EServTerminal.SLAVE,
            server: {
                serviceRefer: /.*/,
                service: {
                    services: option.services,
                },
            },
            session: {
                checkSession: true,
                channel: {
                    type: EServChannel.WINDOW,
                    config: {
                        slave: {
                            getWindow(channel: ServWindowChannel): ServChanleWindowData {
                                const detail = IFrameUtil.generateCreator({
                                        url: option.url,
                                        container: option.container,
                                        showPolicy: EServIFrameShowPolicy.SHOW,
                                    })!.createWindow(channel);

                                return detail;
                            },
                        },
                    },
                },
            },
        });

        if (!terminal.session.isOpened()) {
            await terminal.openSession();
        }
        return terminal;
    }
}
