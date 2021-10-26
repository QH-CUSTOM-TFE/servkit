import { SappSDK } from 'servkit';
import './app.less';
import 'antd/dist/antd.css';
import render, { unmount } from './main';
import { setSDK, unSetSDK } from './core/common';

export const EXAMPLE_ASYNC_APP_ID = 'com.example.async-app';

SappSDK.declAsyncLoad(EXAMPLE_ASYNC_APP_ID, {
    bootstrap: (sdk) => {
        setSDK(sdk);

        sdk.start().then(() => {
            render();
        });
    },
    deBootstrap: () => {
        unmount();
        
        unSetSDK();
    },
});
