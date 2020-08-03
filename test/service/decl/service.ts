import {
    anno,
    API_UNSUPPORT,
    ServAPIArgs,
    ServAPIRetn,
    ServEventer,
    ServService,
} from '../../../src/service/ServService';

export const SERVICE_ID_TEST = 'com.servkit.service.test';
export const SERVICE_ID_TEST1 = 'com.servkit.service.test1';
export const SERVICE_ID_TEST2 = 'com.servkit.service.test2';

@anno.decl({
    id: SERVICE_ID_TEST,
    version: '1.0.0',
})
export class Test extends ServService {
    @anno.decl.api()
    apiNoArgsNoRetn(): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiNoArgsWithRetn(): ServAPIRetn<string> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiWithArgsNoRetn(args: ServAPIArgs<string>): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiWithArgsWithRetn(args: ServAPIArgs<string>): ServAPIRetn<string> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiWithAny<T = any>(args: ServAPIArgs<T>): ServAPIRetn<T> {
        return API_UNSUPPORT();
    }

    @anno.decl.event()
    eventNoArgs: ServEventer;
    
    @anno.decl.event()
    eventWithArgs: ServEventer<string>;

    @anno.decl.event()
    eventAnyArgs: ServEventer<any>;
}

@anno.decl({
    id: SERVICE_ID_TEST1,
    version: '1.0.0',
})
export class Test1 extends ServService {
    @anno.decl.api()
    apiNoArgsNoRetn(): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiNoArgsWithRetn(): ServAPIRetn<string> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiWithArgsNoRetn(args: ServAPIArgs<string>): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiWithArgsWithRetn(args: ServAPIArgs<string>): ServAPIRetn<string> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiWithAny<T = any>(args: ServAPIArgs<T>): ServAPIRetn<T> {
        return API_UNSUPPORT();
    }

    @anno.decl.event()
    eventNoArgs: ServEventer;
    
    @anno.decl.event()
    eventWithArgs: ServEventer<string>;

    @anno.decl.event()
    eventAnyArgs: ServEventer<any>;
}

@anno.decl({
    id: SERVICE_ID_TEST2,
    version: '1.0.0',
})
export class Test2 extends ServService {
    @anno.decl.api()
    apiNoArgsNoRetn(): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiNoArgsWithRetn(): ServAPIRetn<string> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiWithArgsNoRetn(args: ServAPIArgs<string>): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiWithArgsWithRetn(args: ServAPIArgs<string>): ServAPIRetn<string> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiWithAny<T = any>(args: ServAPIArgs<T>): ServAPIRetn<T> {
        return API_UNSUPPORT();
    }

    @anno.decl.event()
    eventNoArgs: ServEventer;
    
    @anno.decl.event()
    eventWithArgs: ServEventer<string>;

    @anno.decl.event()
    eventAnyArgs: ServEventer<any>;
}
