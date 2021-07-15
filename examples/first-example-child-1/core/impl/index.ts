import { AlertService } from '@example/first-children-decl';
import { ServServiceConfig } from 'servkit';
import { AlertServiceImpl } from './alert.service.impl';

/**
 * 服务声明
 */
type ServiceType = Required<ServServiceConfig>['services'];

/**
 * 声明的所有服务
 */
export const ALL_SERVICE: ServiceType =  [
    {
        decl: AlertService,
        impl: AlertServiceImpl,
    },
];
