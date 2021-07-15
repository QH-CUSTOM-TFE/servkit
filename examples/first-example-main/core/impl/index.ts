import { Message2Service, MessageService } from '@example/first-example-decl';
import { ServServiceConfig } from "servkit";
import { MessageServiceImpl } from './message.service.impl';
import { Message2ServiceImpl } from './message2.service.impl';

/**
 * 服务声明
 */
type ServiceType = Required<ServServiceConfig>['services'];

/**
 * 声明的所有服务
 */
export const ALL_SERVICE: ServiceType =  [
    {
        decl: Message2Service,
        impl: Message2ServiceImpl,
    },
    {
        decl: MessageService,
        impl: MessageServiceImpl,
    },
];
