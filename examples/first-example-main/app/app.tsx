import React, { useState, useRef } from 'react';
import { Button, Layout, message, Row, Space } from 'antd';
import { sappMGR } from 'servkit';
import { CHILD_FIRST_APP_ID, CHILD_SECOND_APP_ID } from '../constants';
import SappContainer from './sapp-container';
import { findIndex } from 'lodash';

export interface ISappInState {
    id: string;
}

export function App() {
    const [apps, setApps] = useState<ISappInState[]>([]);

    // 启动应用
    const bootstrapMiniApp = async (id: string) => {
        const currentApp = await sappMGR.create(id, {
            dontStartOnCreate: true,
        });

        setApps([...apps, currentApp.info]);

        currentApp.closed.then(() => {
            setApps((_apps) => {
                return _apps.filter((i) => {
                    return i.id !== currentApp.info.id;
                });
            });
        }).catch(() => {
            message.error('启动失败！');
        });
    };

    return (
        <Layout className="app-layout">
            <Layout.Sider theme={'light'} className="app-layout-left">
                <h2>功能区</h2>
                <Space direction='vertical'>
                    <Button
                        disabled={findIndex(apps, {id: CHILD_FIRST_APP_ID}) !== -1}
                        type="primary" onClick={bootstrapMiniApp.bind(null, CHILD_FIRST_APP_ID)}
                    >打开小程序1</Button>

                    <Button
                        disabled={findIndex(apps, {id: CHILD_SECOND_APP_ID}) !== -1}
                        type="primary" onClick={bootstrapMiniApp.bind(null, CHILD_SECOND_APP_ID)}
                    >打开小程序2</Button>
                </Space>
            </Layout.Sider>
            <Layout.Content className="app-layout-content">
                {
                    apps.map((app) => {
                        return (<SappContainer key={app.id} app={app} />);
                    })
                }
            </Layout.Content>
        </Layout>
    );
}
