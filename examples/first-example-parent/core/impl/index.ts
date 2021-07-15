import { MessageService } from '@example/first-example-decl';
import { ServServiceConfig } from "servkit";
import { MessageServiceImpl } from './message.service.impl';

/**
 * 服务声明
 */
type ServiceType = Required<ServServiceConfig>['services'];

/**
 * 声明的所有服务
 */
export const ALL_SERVICE: ServiceType =  [
    {
        decl: MessageService,
        impl: MessageServiceImpl,
    },
];
