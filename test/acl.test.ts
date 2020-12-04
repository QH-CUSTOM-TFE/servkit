import { ApiACLTest, ServACLTest } from './service/decl/service';
import { ApiACLTestImpl, ServACLTestImpl } from './service/impl/service';
import { ServTerminal } from '../src/terminal/ServTerminal';
import * as tEvent from './terminal/event';
import * as tMessage from './terminal/message';
import * as tWindow from './terminal/window';
import { servkit } from '../src/servkit/Servkit';
import { delay } from './util';

const serviceApiTest = async (
    { master, slave }: { master: ServTerminal, slave: ServTerminal },
) => {
    {
        const ret = await slave.client.serviceExec(ApiACLTest, async (service) => {
            await service.defaultPublicAPI().then(() => {
                //
            }, () => {
                expect(true).toBe(false);
            });

            await service.publicAPI().then(() => {
                //
            }, () => {
                expect(true).toBe(false);
            });

            await service.privateAPI().then(() => {
                expect(true).toBe(false);
            }, () => {
                //
            });
        });
        expect(ret).not.toBeNull();
    }

    {
        const ret = await master.client.serviceExec(ServACLTest, async (service) => {
            await service.defaultPublicAPI().then(() => {
                expect(true).toBe(false);
            }, () => {  
                //
            });

            await service.publicAPI().then(() => {
                expect(true).toBe(false);
            }, () => {
                //
            });

            await service.privateAPI().then(() => {
                expect(true).toBe(false);
            }, () => {
                //
            });
        });

    }
    await delay(200);
};

const serviceEventTest = async (
    { master, slave }: { master: ServTerminal, slave: ServTerminal },
) => {
    let onDefPubCount = 0;
    let onPubCount = 0;
    let onPriCount = 0;
    let unListen: any;
    {
        const ret = await slave.client.serviceExec(ApiACLTest, async (service) => {
            const a = service.defaultPublicEvent.on(() => {
                onDefPubCount++;
            });

            const b = service.publicEvent.on(() => {
                onPubCount++;
            });

            const c = service.privateEvent.on(() => {
                onPriCount++;
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
        const ret = await master.server.serviceExec(ApiACLTest, async (service) => {
            service.publicEvent.emit();
            service.defaultPublicEvent.emit();
            service.privateEvent.emit();
        });
        expect(ret).not.toBeNull();

    }
    await delay(200);
    unListen();

    expect(onDefPubCount).toBe(1);
    expect(onPubCount).toBe(1);
    expect(onPriCount).toBe(0);
};

const testTerminal = async (port: typeof tEvent) => {
    const datas = port.createTerminal();
    expect(datas.master.openSession()).resolves.toBeUndefined();
    await delay(200);
    expect(datas.slave.openSession()).resolves.toBeUndefined();
    await delay(200);

    await serviceEventTest(datas);
    await serviceApiTest(datas);

    await delay(800);

    datas.destroy();
};

test('Service ACL', async () => {
    servkit.service.addServices([
        {
            decl: ApiACLTest, impl: ApiACLTestImpl,
        },
        {
            decl: ServACLTest, impl: ServACLTestImpl,
        },
    ]);
    await testTerminal(tEvent);
    await testTerminal(tMessage);
    await testTerminal(tWindow);
    servkit.service.remServices([ApiACLTest, ServACLTest]);
}, 60000);
