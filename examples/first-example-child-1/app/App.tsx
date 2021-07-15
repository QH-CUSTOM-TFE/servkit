import { Message2Service, MessageService } from '@example/first-example-decl';
import { Button, Row } from 'antd';
import React from 'react';
import { sappSDK } from 'servkit';

export function App() {

    const showMessage = async () => {
        const message = await sappSDK.getService(Message2Service);
        await message!.info('点击弹出成功！');
    };

    const showMessage1 = async () => {
        const message = await sappSDK.getService(MessageService);
        await message!.info('点击弹出成功！');
    };

    return (
        <Row>
            <Button onClick={showMessage}>弹出提示信息！</Button>
            <Button onClick={showMessage1}>弹出提示信息！</Button>
        </Row>
    );
}
