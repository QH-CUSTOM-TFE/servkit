import './app.less';
import { Button, Layout, Space } from 'antd';
import React from 'react';

export function App() {
    return (
        <Layout className="app-layout">
            <Layout.Sider theme={'light'} className="app-layout-left">
                <h2>功能区</h2>
                <Space direction='vertical'>
                    <Button
                        type="primary"
                    >打开小程序1</Button>
                    <Button
                        type="primary"
                    >打开小程序2</Button>
                </Space>
            </Layout.Sider>
            <Layout.Content className="app-layout-content">
                <iframe style={{width: '100%', height: '100%', border: 'none'}} src="/first-example-main" ></iframe>
            </Layout.Content>
        </Layout >
    );
}
