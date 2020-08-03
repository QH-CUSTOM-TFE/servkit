import { Test, Test1, SERVICE_ID_TEST, SERVICE_ID_TEST1 } from './service/decl/service';
import { TestImpl, Test1Impl } from './service/impl/service';
import { ServServiceManager } from '../src/service/ServServiceManager';

test('ServiceManager', () => {
    const service = new ServServiceManager();
    service.init({
        services: [
            {
                decl: Test, impl: TestImpl,
            },
        ],
    });

    expect(service.getService(Test)).toBeInstanceOf(TestImpl);
    expect(service.addService(Test, TestImpl)).toBeFalsy();
    expect(service.addService(Test1, Test1Impl)).toBeTruthy();
    expect(service.getService(Test1)).toBeInstanceOf(Test1Impl);
    expect(service.getServiceByID(SERVICE_ID_TEST)).toBeInstanceOf(TestImpl);
    expect(service.getServiceByID(SERVICE_ID_TEST1)).toBeInstanceOf(Test1Impl);
    expect(service.remService(Test1)).toBeTruthy();
    expect(service.getService(Test1)).toBeUndefined();

    service.release();
    expect(service.getService(Test)).toBeUndefined();
});

test('ServiceManager Reference', () => {
    const service = new ServServiceManager();
    service.init({
        services: [
            {
                decl: Test, impl: TestImpl,
            },
            {
                decl: Test1, impl: Test1Impl,
            },
        ],
    });

    const referNone = service.referServices('');
    expect(referNone.canRefer(SERVICE_ID_TEST)).toBeFalsy();
    expect(referNone.canRefer(SERVICE_ID_TEST1)).toBeFalsy();
    expect(referNone.getService(Test)).toBeUndefined();
    expect(referNone.getService(Test1)).toBeUndefined();
   
    const referTest = service.referServices(SERVICE_ID_TEST);
    expect(referTest.canRefer(SERVICE_ID_TEST)).toBeTruthy();
    expect(referTest.canRefer(SERVICE_ID_TEST1)).toBeFalsy();
    expect(referTest.getService(Test)).toBeInstanceOf(TestImpl);
    expect(referTest.getService(Test1)).toBeUndefined();
    
    const referAll = service.referServices(/.*/);
    expect(referAll.canRefer(SERVICE_ID_TEST)).toBeTruthy();
    expect(referAll.canRefer(SERVICE_ID_TEST1)).toBeTruthy();
    expect(referAll.getService(Test)).toBeInstanceOf(TestImpl);
    expect(referAll.getService(Test1)).toBeInstanceOf(Test1Impl);

    const referFunc = service.referServices((item) => item === SERVICE_ID_TEST);
    expect(referFunc.canRefer(SERVICE_ID_TEST)).toBeTruthy();
    expect(referFunc.canRefer(SERVICE_ID_TEST1)).toBeFalsy();
    expect(referFunc.getService(Test)).toBeInstanceOf(TestImpl);
    expect(referFunc.getService(Test1)).toBeUndefined();

    const referArray = service.referServices([(item) => item === SERVICE_ID_TEST, SERVICE_ID_TEST1]);
    expect(referArray.canRefer(SERVICE_ID_TEST)).toBeTruthy();
    expect(referArray.canRefer(SERVICE_ID_TEST1)).toBeTruthy();
    expect(referArray.getService(Test)).toBeInstanceOf(TestImpl);
    expect(referArray.getService(Test1)).toBeInstanceOf(Test1Impl);
});
