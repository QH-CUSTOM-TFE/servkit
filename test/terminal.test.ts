import { createMasterTerminal, destroyTerminal } from './terminal/create';
import { EServChannel } from '../src';
import { Test, Test1, Test2 } from './service/decl/service';
import { TestImpl, Test1Impl } from './service/impl/service';
import { ServTerminal } from '../src/terminal/ServTerminal';
import * as tEvent from './terminal/event';
import * as tMessage from './terminal/message';
import * as tWindow from './terminal/window';
// import * as tSappSDK from './terminal/sapp';
import { STRING_VALUE, STRING_VALUE1, OBJECT_VALUE1, delay, OBJECT_VALUE } from './util';
import { servkit } from '../src/servkit/Servkit';

test('Terminal Service', () => {
    const terminal = createMasterTerminal(EServChannel.EVENT);
    expect(terminal).toBeTruthy();
    try {
        const terminal2 = createMasterTerminal(EServChannel.EVENT);
        expect(false).toBeTruthy();
    } catch (e) {
        //
    }
    destroyTerminal(terminal);
    expect(terminal.session.isOpened()).toBeFalsy();

    try {
        const terminal2 = createMasterTerminal(EServChannel.EVENT);
    } catch (e) {
        expect(false).toBeTruthy();
    }

    const { master, slave, destroy } = tEvent.createTerminal();
    expect(master.server.getService(Test)).toBeInstanceOf(TestImpl);
    expect(master.server.getService(Test1)).toBeUndefined();

    expect(slave.server.getService(Test)).toBeUndefined();
    expect(slave.server.getService(Test1)).toBeUndefined();

    destroy();
});

test('Terminal Open Serssion', async () => {
    const { master, slave, destroy } = tEvent.createTerminal();
    await expect(master.openSession()).resolves.toBeUndefined();
    await expect(slave.openSession()).resolves.toBeUndefined();
    destroy();
    expect(master.session.isOpened()).toBeFalsy();
    expect(slave.session.isOpened()).toBeFalsy();
});

const serviceAPITest = async (
    { master, slave }: { master: ServTerminal, slave: ServTerminal },
    decl?: typeof Test | typeof Test1,
) => {
    decl = decl || Test;
    const ret = await slave.client.serviceExec(decl, async (service) => {
        await service.apiNoArgsNoRetn();
        await expect(service.apiNoArgsWithRetn()).resolves.toBe(STRING_VALUE);
        await service.apiWithArgsNoRetn(STRING_VALUE);
        await expect(service.apiWithArgsWithRetn(STRING_VALUE1)).resolves.toBe(STRING_VALUE1);
        const data = await service.apiWithAny(OBJECT_VALUE1);
        expect(data.value).toBe(OBJECT_VALUE1.value);

        await expect(service.apiRetnPlusTransform(0)).resolves.toBe(4);
        await service.apiCallTransform(STRING_VALUE);
        await expect(service.apiRetnTransform()).resolves.toBe(STRING_VALUE);
    });

    expect(ret).not.toBeNull();
};

const serviceAPITimeoutTest = async (
    { master, slave }: { master: ServTerminal, slave: ServTerminal },
) => {
    const decl = Test;
    const ret = await slave.client.serviceExec(decl, async (service) => {
        try {
            await service.apiCustomTimeout();
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e.message).toBe('timeout');
        }

        try {
            await service.apiDefaultTimeout();
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e.message).toBe('timeout');
        }

        const v = await Promise.race([service.apiNeverTimeout(), new Promise((res) => {
            setTimeout(() => {
                res(STRING_VALUE);
            }, 800);
        })]);
        expect(v).toBe(STRING_VALUE);
    });

    expect(ret).not.toBeNull();
};

const serviceUnknowServiceTest = async (
    { master, slave }: { master: ServTerminal, slave: ServTerminal },
) => {
    {
        const ret = await slave.client.serviceExec(Test2, async (service) => {
            await service.apiNoArgsNoRetn().then(() => {
                expect(true).toBeFalsy();
            }, () => {
                //
            });
        });

        expect(ret).not.toBeNull();
    }

    {
        const ret = await master.server.serviceExec(Test2, async (service) => {
            //
        });

        expect(ret).toBeNull();
    }
};

const serviceEventTest = async (
    { master, slave }: { master: ServTerminal, slave: ServTerminal },
    decl?: typeof Test | typeof Test1,
) => {
    decl = decl || Test;

    let onCount = 0;
    let onceCount = 0;
    let onStringData: any;
    let onAnyData: any;
    let unListen: any;
    {
        const ret = await slave.client.serviceExec(decl, async (service) => {
            const a = service.eventNoArgs.on(() => {
                onCount++;
            });

            service.eventNoArgs.once(() => {
                onceCount++;
            });

            const b = service.eventWithArgs.on((data) => {
                onStringData = data;
            });

            const c = service.eventAnyArgs.on((data) => {
                onAnyData = data;
            });

            return () => {
                a();
                b();
                c();
            };
        });
        expect(ret).not.toBeNull();

        unListen = ret;
    }

    {
        const ret = await master.server.serviceExec(decl, async (service) => {
            service.eventNoArgs.emit(undefined);
            service.eventNoArgs.emit(undefined);
            service.eventWithArgs.emit(STRING_VALUE);
            service.eventAnyArgs.emit(OBJECT_VALUE);
        });
        expect(ret).not.toBeNull();

    }
    await delay(200);
    unListen();

    expect(onCount).toBe(2);
    expect(onceCount).toBe(1);
    expect(onStringData).toBe(STRING_VALUE);
    expect(onAnyData.value).toBe(OBJECT_VALUE.value);
};

const serviceMessageTest = async (
    { master, slave }: { master: ServTerminal, slave: ServTerminal },
) => {
    const unlisten = master.session.onRecvCallMessage((type, args, doReturn) => {
        if (type === 'testNoArgsNoRetn') {
            doReturn();
            return true;
        }

        if (type === 'testWithArgsNoRetn') {
            expect(args).toBe(STRING_VALUE);
            doReturn();
            return true;
        }

        if (type === 'testNoArgsWithRetn') {
            expect(args).toBe(STRING_VALUE);
            doReturn();
            return true;
        }

        if (type === 'testWithArgsWithRetn') {
            doReturn(args);
            return true;
        }

        if (type === 'testWithAny') {
            doReturn(args);
            return true;
        }

        return false;
    });

    await slave.session.callMessage('testNoArgsNoRetn');
    await slave.session.callMessage('testWithArgsNoRetn', STRING_VALUE);
    const data = await slave.session.callMessage('testWithArgsWithRetn', STRING_VALUE);
    expect(data).toBe(STRING_VALUE);
    const data1 = await slave.session.callMessage('testWithAny', OBJECT_VALUE);
    expect(data1.value).toBe(OBJECT_VALUE.value);

    {
        const p = slave.session.callMessage('unknow');
        await p.then(() => {
            expect(true).toBeFalsy();
        }, () => {
            //
        });
    }

    unlisten();

    {
        const p = slave.session.callMessage('testNoArgsNoRetn');
        await p.then(() => {
            expect(true).toBeFalsy();
        }, () => {
            //
        });
    }

    {
        const p = slave.session.callMessage('testWithArgsNoRetn');
        await p.then(() => {
            expect(true).toBeFalsy();
        }, () => {
            //
        });
    }    
};

const testTerminal = async (port: typeof tEvent) => {
    const datas = port.createTerminal();
    expect(datas.master.openSession()).resolves.toBeUndefined();
    await delay(200);
    expect(datas.slave.openSession()).resolves.toBeUndefined();
    await delay(200);

    await serviceUnknowServiceTest(datas);

    await serviceAPITest(datas);
    await serviceEventTest(datas);

    await serviceAPITest(datas, Test1);
    await serviceEventTest(datas, Test1);

    await serviceMessageTest(datas);

    await serviceAPITimeoutTest(datas);

    await delay(800);

    datas.destroy();
};

test('Terminal Service', async () => {
    servkit.service.addServices([
        {
            decl: Test1, impl: Test1Impl,
        },
    ]);
    await testTerminal(tEvent);
    await testTerminal(tMessage);
    await testTerminal(tWindow);
    // await testTerminal(tSappSDK);
    servkit.service.remServices([Test1]);
}, 60000);
