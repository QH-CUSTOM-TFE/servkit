import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app/app';

export default () => {
    ReactDOM.render(<App/>, document.querySelector('#app'));
};
