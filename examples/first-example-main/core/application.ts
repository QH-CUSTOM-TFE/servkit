import { sappMGR } from 'servkit';
import { ALL_APP_INFOS } from '../constants';
import { ALL_SERVICE } from './impl';
import { find } from 'lodash';

sappMGR.setConfig({
    loadAppInfo: async (mgr, id) => {
        return find(ALL_APP_INFOS, {id})!;
    },
}).addServices(ALL_SERVICE, {lazy: true});
