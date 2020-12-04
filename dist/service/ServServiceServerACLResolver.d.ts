import { ServServiceMeta, ServAPIMeta, ServEventerMeta } from './ServService';
import { ServServiceServer } from './ServServiceServer';
export declare class ServServiceServerACLResolver {
    canAccessService(server: ServServiceServer, service: ServServiceMeta): boolean;
    canAccessAPI(server: ServServiceServer, service: ServServiceMeta, api: ServAPIMeta): boolean;
    canAccessEventer(server: ServServiceServer, service: ServServiceMeta, event: ServEventerMeta): boolean;
}
