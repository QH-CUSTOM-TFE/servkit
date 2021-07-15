import { Button, Card, Modal } from 'antd';
import React, { memo, useEffect, useRef } from 'react';
import { sappMGR } from 'servkit';
import { ISappInState } from '../app';
import './index.less';

export interface ISappContainerProps {
    app: ISappInState;
}

export function SappContainer(props: ISappContainerProps) {
    const ref = useRef<any>();

    useEffect(() => {

        const sapp = sappMGR.getApp(props.app.id)!;

        const controller = sapp.getController();
        controller?.setLayoutOptions({
            container: ref.current,
            className: 'sapp-frame',
        });
        sapp.start();

        return () => {
            sapp.close();
        };
    }, []);

    const close = () => {
        const sapp = sappMGR.getApp(props.app.id)!;

        sapp.close();
    };

    const title = (
        <div>
        小程序
            <Button
                size={'small'}
                className="fr"
                onClick={close}
            >
                退出
            </Button>
        </div>
    );

    return (
        <Card
            className="sapp-container-wrap"
            title={title}
            style={{width: '300px', height: '100%', display: 'flex', flexDirection: 'column'}}
            bodyStyle={{flex: 1}}
        >
            <div className="sapp-container" ref={ref}></div>
        </Card>
    );
}

export default memo(SappContainer);
