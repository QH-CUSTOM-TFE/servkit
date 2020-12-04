import { ServServiceServerACLResolver } from '../src/service/ServServiceServerACLResolver';
import { ServServiceServer } from '../src/service/ServServiceServer';
import { ServServiceMeta, ServEventerMeta, ServAPIMeta } from '../src/service/ServService';
import { EACL } from './service/decl/service';
export const STRING_VALUE = 'servkit';
export const STRING_VALUE1 = 'servkit1';
export const OBJECT_VALUE = { value: STRING_VALUE };
export const OBJECT_VALUE1 = { value: STRING_VALUE1 };

export const delay = (time: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

export class ACLResolver extends ServServiceServerACLResolver {
    canAccessService(server: ServServiceServer, service: ServServiceMeta) {
        return service.ACL !== EACL.PRIVATE;
    }

    canAccessEventer(server: ServServiceServer,
                     service: ServServiceMeta,
                     event: ServEventerMeta) {
        return this.canAccessService(server, service) && event.options.ACL !== EACL.PRIVATE;
    }

    canAccessAPI(server: ServServiceServer,
                 service: ServServiceMeta,
                 api: ServAPIMeta) {
        return this.canAccessService(server, service) && api.options.ACL !== EACL.PRIVATE;
    }
}
