import React, { useEffect, useRef } from 'react';
import { Button, Layout } from 'antd';

export function App() {
    const ref = useRef<any>();

    useEffect(() => {
    });

    return (
        <Layout className="app-layout">
            <Layout.Sider theme={'light'} className="app-layout-left">
                <h2>功能区</h2>
                <div>
                    <Button type="primary" onClick={}>打开窗口</Button>
                </div>
            </Layout.Sider>
            <Layout.Content >
                <div ref={ref}>1111</div>
            </Layout.Content>
        </Layout>
    );
}
