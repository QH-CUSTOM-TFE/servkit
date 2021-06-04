import { sappSDK } from 'servkit';
import './app.less';
import 'antd/dist/antd.css';
import render from './main';

sappSDK.setConfig({}).start().then(() => {
    render();
});
