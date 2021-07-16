import { MessageService } from '@example/first-example-decl';
import { Button, Layout, Space } from 'antd';
import React, { useRef } from 'react';
import './app.less';
import { shostSDK } from 'servkit';
import { MessageService as ParentMessageService } from '@example/first-example-parent-decl';
import { MessageServiceImpl } from '../core/impl/message.service.impl';

shostSDK.setConfig({
    resolveContentPageUrl: () => {
        return '/first-example-main';
    },
    services: [
        {
            decl: ParentMessageService,
            impl: MessageServiceImpl,
        },
    ],
});

export function App() {
    const ref = useRef<any>();

    const openApp = async () => {
        shostSDK.start({
            layout: {
                container: ref.current,
            },
        });
    };

    const exitApp = async () => {
        const closed = await shostSDK.close();
        if (!closed) {
            alert('被主应用打断关闭操作');
        }
    };

    const showMessage = async () => {
        const service = shostSDK.getService(MessageService);
        service?.info('aaaa');
    };

    return (
        <Layout className="app-layout">
            <Layout.Sider theme={'light'} className="app-layout-left">
                <a href="/">返回</a>
                <h2>HOST环境</h2>
                <Space direction='vertical'>
                    <Button
                        type="primary"
                        onClick={openApp}
                    >打开主应用</Button>
                    <Button
                        type="primary"
                        onClick={exitApp}
                    >退出主应用</Button>
                </Space>
                <h2>远程调用方法</h2>
                <Space direction='vertical'>
                    <Button onClick={showMessage}>主应用中弹出提示</Button>
                </Space>
            </Layout.Sider>
            <Layout.Content className="app-layout-content">
                <div ref={ref} className="app-framework-container"></div>
            </Layout.Content>
        </Layout >
    );
}
