import { ServServiceMeta, ServAPIMeta, ServEventerMeta } from './ServService';
import { ServServiceServer } from './ServServiceServer';
export class ServServiceServerACLResolver {
    canAccessService(server: ServServiceServer, service: ServServiceMeta)
        : boolean {
        return true;
    }

    canAccessAPI(server: ServServiceServer, service: ServServiceMeta, api: ServAPIMeta)
        : boolean {
        return true;
    }

    canAccessEventer(
        server: ServServiceServer,
        service: ServServiceMeta,
        event: ServEventerMeta)
        : boolean {
        return true;
    }
}
