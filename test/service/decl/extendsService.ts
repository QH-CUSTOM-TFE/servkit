import {
    anno,
    API_UNSUPPORT,
    ServAPIOptions,
    ServDeclOptions,
    ServEventer, ServEventerOptions,
    ServNotifyOptions,
    ServService,
} from '../../../src';

export const TestServiceDecl: ServDeclOptions = {
    id: 'test.service',
    version: '1.0.0',
};

export const TestServiceTestApi: ServAPIOptions = {
    timeout: 1000,
};

export const TestServiceNotifyApi: ServNotifyOptions = {
    ACL: 1,
};

export const TestServiceEventApi: ServEventerOptions = {
    ACL: 1,
};

@anno.decl(TestServiceDecl)
export class TestService extends ServService {

    @anno.decl.api(TestServiceTestApi)
    testApi() {
        return API_UNSUPPORT();
    }

    @anno.decl.notify(TestServiceNotifyApi)
    notifyApi() {
        return API_UNSUPPORT();
    }

    @anno.decl.event(TestServiceEventApi)
    public event: ServEventer<any>;

}

export const Test1ServiceDecl: ServDeclOptions = {
    id: 'test1.service',
    version: '1.0.1',
};

@anno.decl(Test1ServiceDecl)
export class PureExtendsTestService extends TestService {}
