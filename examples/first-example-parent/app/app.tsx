import { MessageService } from '@example/first-example-decl';
import { Button, Layout, Space } from 'antd';
import React, { useRef } from 'react';
import {
    EServChannel,
    EServIFrameShowPolicy,
    EServTerminal,
    IFrameUtil,
    SappHelper,
    servkit,
    ServTerminal,
} from 'servkit';
import './app.less';

export function App() {
    const ref = useRef<any>();

    let terminal: ServTerminal | undefined;

    const openApp = async () => {
        /*servkit.createTerminal({
            id: '',
            type: EServTerminal.SLAVE,
            session: {
                channel: EServChannel.WINDOW,
            },
        });*/
        terminal = await SappHelper.create({
            terminalId: 'test-terminal-id',
            services: [],
            url: '/first-example-main',
            container: ref.current,
        });
    };

    const showMessage = async () => {
        const service = terminal!.server.getService(MessageService);
        service?.info('aaaa');
    };

    return (
        <Layout className="app-layout">
            <Layout.Sider theme={'light'} className="app-layout-left">
                <h2>功能区</h2>
                <Space direction='vertical'>
                    <Button
                        type="primary"
                        onClick={openApp}
                    >打开主体</Button>
                </Space>
                <h2>远程调用方法</h2>
                <Space direction='vertical'>
                    <Button onClick={showMessage}>弹出提示</Button>
                </Space>
            </Layout.Sider>
            <Layout.Content className="app-layout-content">
                <div ref={ref} className="app-framework-container"></div>
            </Layout.Content>
        </Layout >
    );
}
