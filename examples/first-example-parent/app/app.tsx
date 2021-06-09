import { Button, Layout, Space } from 'antd';
import React, { useRef } from 'react';
import { EServChannel, EServIFrameShowPolicy, EServTerminal, IFrameUtil, servkit } from 'servkit';
import './app.less';

export function App() {
    const ref = useRef<any>();

    const openApp = () => {
        /*servkit.createTerminal({
            id: '',
            type: EServTerminal.SLAVE,
            session: {
                channel: EServChannel.WINDOW,
            },
        });*/
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
                    <Button>弹出提示</Button>
                </Space>
            </Layout.Sider>
            <Layout.Content itemRef={'aaaa'} className="app-layout-content">
                <div ref={ref} className="app-framework-container"></div>
            </Layout.Content>
        </Layout >
    );
}
