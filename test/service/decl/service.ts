import { STRING_VALUE, STRING_VALUE1 } from '../../util';
import { setEnv, setServConstant } from '../../../src/common/common';

setEnv({
    DEV: false,
    JEST: true,
});

setServConstant({
    SERV_API_TIMEOUT: 500,
    SERV_SESSION_OPEN_TIMEOUT: 500,
    SERV_SESSION_CALL_MESSAGE_TIMEOUT: 500,
});

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
export const SERVICE_ID_APIACL = 'com.servkit.service.apiacl';
export const SERVICE_ID_SERVACL = 'com.servkit.service.servacl';

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

    @anno.decl.api({
        timeout: 1,
    })
    apiCustomTimeout(args: ServAPIArgs): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    apiDefaultTimeout(args: ServAPIArgs): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        timeout: 0,
    })
    apiNeverTimeout(args: ServAPIArgs): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        onCallTransform: {
            send(args: string) {
                expect(args).toBe(STRING_VALUE);
                return STRING_VALUE1;
            },
            recv(args: string) {
                expect(args).toBe(STRING_VALUE1);
                return STRING_VALUE;
            },
        },
    })
    apiCallTransform(args: ServAPIArgs<string>): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        onRetnTransform: {
            send(args: string) {
                expect(args).toBe(STRING_VALUE);
                return STRING_VALUE1;
            },
            recv(args: string) {
                expect(args).toBe(STRING_VALUE1);
                return STRING_VALUE;
            },
        },
    })
    apiRetnTransform(args: ServAPIArgs<void>): ServAPIRetn<string> {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        onCallTransform: {
            send(args: number) {
                ++args;
                return args;
            },
            recv(args: number) {
                ++args;
                return args;
            },
        },
        onRetnTransform: {
            send(args: number) {
                ++args;
                return args;
            },
            recv(args: number) {
                ++args;
                return args;
            },
        },
    })
    apiRetnPlusTransform(args: ServAPIArgs<number>): ServAPIRetn<number> {
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

    @anno.decl.api({
        onCallTransform: {
            send(args: string) {
                expect(args).toBe(STRING_VALUE);
                return STRING_VALUE1;
            },
            recv(args: string) {
                expect(args).toBe(STRING_VALUE1);
                return STRING_VALUE;
            },
        },
    })
    apiCallTransform(args: ServAPIArgs<string>): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        onRetnTransform: {
            send(args: string) {
                expect(args).toBe(STRING_VALUE);
                return STRING_VALUE1;
            },
            recv(args: string) {
                expect(args).toBe(STRING_VALUE1);
                return STRING_VALUE;
            },
        },
    })
    apiRetnTransform(args: ServAPIArgs<void>): ServAPIRetn<string> {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        onCallTransform: {
            send(args: number) {
                ++args;
                return args;
            },
            recv(args: number) {
                ++args;
                return args;
            },
        },
        onRetnTransform: {
            send(args: number) {
                ++args;
                return args;
            },
            recv(args: number) {
                ++args;
                return args;
            },
        },
    })
    apiRetnPlusTransform(args: ServAPIArgs<number>): ServAPIRetn<number> {
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

export enum EACL {
    PRIVATE = 0,
    PUBLIC,
}

@anno.decl({
    id: SERVICE_ID_APIACL,
    version: '1.0.0',
})
export class ApiACLTest extends ServService {
    @anno.decl.api({
        ACL: EACL.PRIVATE, 
    })
    privateAPI(): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    defaultPublicAPI(): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        ACL: EACL.PUBLIC,
    })
    publicAPI(): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.event({
        ACL: EACL.PRIVATE, 
    })
    privateEvent: ServEventer;
    
    @anno.decl.event()
    defaultPublicEvent: ServEventer;

    @anno.decl.event({
        ACL: EACL.PUBLIC,
    })
    publicEvent: ServEventer;
}

@anno.decl({
    id: SERVICE_ID_SERVACL,
    version: '1.0.0',
    ACL: EACL.PRIVATE,
})
export class ServACLTest extends ServService {
    @anno.decl.api()
    defaultPublicAPI(): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        ACL: EACL.PUBLIC,
    })
    publicAPI(): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.api({
        ACL: EACL.PRIVATE,
    })
    privateAPI(): ServAPIRetn {
        return API_UNSUPPORT();
    }

    @anno.decl.event({
        ACL: EACL.PRIVATE, 
    })
    privateEvent: ServEventer;
    
    @anno.decl.event()
    defaultPublicEvent: ServEventer;

    @anno.decl.event({
        ACL: EACL.PUBLIC,
    })
    publicEvent: ServEventer;
}
