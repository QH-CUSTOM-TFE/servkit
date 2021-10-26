import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app/App';
import { sappSDK } from './core/common';

let el: HTMLElement;
export default () => {
    el = sappSDK.getDefaultStartParams()?.container!;
    ReactDOM.render(<App/>, el);
};

export function unmount() {
    if (el) {
        ReactDOM.unmountComponentAtNode(el);
        el = undefined!;
    }
    
}
