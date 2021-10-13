import { ESappType } from "servkit";

export const CHILD_FIRST_APP_ID = 'com.example.first.child-1';

export const CHILD_SECOND_APP_ID = 'com.example.first.child-2';

export const EXAMPLE_ASYNC_APP_ID = 'com.example.async-app';

export const ALL_APP_INFOS = [
    {
        id: CHILD_FIRST_APP_ID,
        version: '1.0.1',
        url: '/first-example-child-1',
        options: {},
    },
    {
        id: CHILD_SECOND_APP_ID,
        version: '1.0.1',
        url: '/first-example-child-2',
        options: {},
    },
    {
        id: EXAMPLE_ASYNC_APP_ID,
        version: '1.0.1',
        url: '',
        html: '/example-async-app',
        type: ESappType.ASYNC_LOAD,
        options: {},
    },
];
