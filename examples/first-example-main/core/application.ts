import { EServRPCEvent, sappMGR } from 'servkit';
import { ALL_APP_INFOS } from '../constants';
import { ALL_SERVICE } from './impl';
import { find } from 'lodash';

sappMGR.setConfig({
    loadAppInfo: async (mgr, id) => {
        return find(ALL_APP_INFOS, {id})!;
    },
}).addServices(ALL_SERVICE, {lazy: true});

sappMGR.createHost({
    onCloseHandle: async () => {
        const dontClose = Math.random() > 0.5;
        if (dontClose) {
            alert('打断关闭操作');
        }
        return {
            dontClose,
        };
    },
});

sappMGR.getServkit().on(EServRPCEvent.CALL, (...args) => {
    // tslint:disable-next-line:no-console
    console.log('RPC CALL Event', args);
});
