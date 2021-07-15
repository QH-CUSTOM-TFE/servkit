import { sappSDK } from 'servkit';
import './app.less';
import 'antd/dist/antd.css';
import { ALL_SERVICE } from './core/impl';
import render from './main';

sappSDK.setConfig({
    services: ALL_SERVICE,
}).start().then(() => {
    render();
});
