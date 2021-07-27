import { anno, API_UNSUPPORT, ServEventer, ServNotifyOptions } from '../src';
import { PureExtendsTestService, Test1ServiceDecl, TestService, TestServiceTestApi } from './service/decl/extendsService';

describe('test api override decl', function() {

    test('should equal when pure extends ', function() {
        const meta = PureExtendsTestService.meta();
        expect(meta?.id).toBe(Test1ServiceDecl.id);
        expect(meta?.version).toBe(Test1ServiceDecl.version);
        expect(meta?.apis).toStrictEqual(TestService.meta()?.apis);
    });

    test('should add new apis when extends service', function() {

        const apiDecl = {
            id: 'add.test',
            version: '1.0.0',
        };
        const addApi = {
            timeout: 1,
        };

        @anno.decl(apiDecl)
        class AddTest extends TestService {
            @anno.decl.api(addApi)
            add() {
                return API_UNSUPPORT();
            }
        }

        const metaData = AddTest.meta();
        expect(metaData!.apis).toStrictEqual([...TestService.meta()!.apis, {name: 'add', options: addApi}]);
    });

    test('should override testApi apis when extends service', function() {

        const apiDecl = {
            id: 'add.test',
            version: '1.0.0',
        };
        const addApi = {
            timeout: 1,
        };

        @anno.decl(apiDecl)
        class AddTest extends TestService {
            @anno.decl.api(addApi)
            testApi() {
                return API_UNSUPPORT();
            }
        }

        const metaData = AddTest.meta();
        const testServiceMeta = TestService.meta();
        expect(metaData!.apis).toStrictEqual(testServiceMeta?.apis.map((it) => {
            if (it.name === 'testApi') {
                return {
                    ...it,
                    options: addApi,
                };
            }
            return it;
        }));
    });
});

describe('test notify override decl', function() {

    test('should add new apis when extends service by notify', function() {

        const apiDecl = {
            id: 'add.test',
            version: '1.0.0',
        };
        const addApi: ServNotifyOptions = {
            ACL: 1,
        };

        @anno.decl(apiDecl)
        class AddTest extends TestService {
            @anno.decl.notify(addApi)
            add() {
                return API_UNSUPPORT();
            }
        }

        const metaData = AddTest.meta();
        expect(metaData!.apis).toStrictEqual([...TestService.meta()!.apis, {name: 'add', options: addApi}]);
    });

    test('should override testApi apis when extends service by notify', function() {

        const apiDecl = {
            id: 'add.test',
            version: '1.0.0',
        };
        const addApi: ServNotifyOptions = {
            ACL: 1,
        };

        @anno.decl(apiDecl)
        class AddTest extends TestService {
            @anno.decl.notify(addApi)
            testApi() {
                return API_UNSUPPORT();
            }
        }

        const metaData = AddTest.meta();
        const testServiceMeta = TestService.meta();
        expect(metaData!.apis).toStrictEqual(testServiceMeta?.apis.map((it) => {
            if (it.name === 'testApi') {
                return {
                    ...it,
                    options: addApi,
                };
            }
            return it;
        }));
    });
});

describe('test event override decl', function() {

    test('should add new evts when extends service', function() {

        const apiDecl = {
            id: 'add.test',
            version: '1.0.0',
        };
        const eventOptions = {
            ACL: 1,
        };

        @anno.decl(apiDecl)
        class AddTest extends TestService {
            @anno.decl.event(eventOptions)
            public event2: ServEventer<any>;
        }

        const metaData = AddTest.meta();
        expect(metaData!.evts).toStrictEqual([...TestService.meta()!.evts, {name: 'event2', options: eventOptions}]);
    });

    test('should override testApi evts when extends service', function() {

        const apiDecl = {
            id: 'add.test',
            version: '1.0.0',
        };
        const eventOptions = {
            EXT: 1,
        };

        @anno.decl(apiDecl)
        class AddTest extends TestService {
            @anno.decl.event(eventOptions)
            public event: ServEventer<any>;
        }

        const metaData = AddTest.meta();
        const testServiceMeta = TestService.meta();
        expect(metaData!.evts).toStrictEqual(testServiceMeta?.evts.map((it) => {
            if (it.name === 'event') {
                return {
                    ...it,
                    options: eventOptions,
                };
            }
            return it;
        }));
    });
});
