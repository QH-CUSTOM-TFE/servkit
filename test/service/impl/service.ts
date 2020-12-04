import {
    anno,
    API_SUCCEED,
    ServAPIArgs,
    ServAPIRetn,
    ServEventer,
} from '../../../src';
import { Test, Test1, ApiACLTest, ServACLTest } from '../decl/service';
import { STRING_VALUE } from '../../util';

@anno.impl()
export class TestImpl extends Test {
    apiNoArgsNoRetn(): ServAPIRetn<void> {
        return API_SUCCEED();
    }

    apiNoArgsWithRetn(): ServAPIRetn<string> {
        return API_SUCCEED(STRING_VALUE);
    }

    apiWithArgsNoRetn(args: ServAPIArgs<string>): ServAPIRetn<void> {
        expect(args).toBe(STRING_VALUE);
        return API_SUCCEED();
    }

    apiWithArgsWithRetn(args: ServAPIArgs<string>): ServAPIRetn<string> {
        return API_SUCCEED(args);
    }

    apiWithAny<T = any>(args: ServAPIArgs<T>): ServAPIRetn<T> {
        return API_SUCCEED(args);
    }

    apiCallTransform(args: ServAPIArgs<string>): ServAPIRetn<void> {
        return API_SUCCEED();
    }

    apiRetnTransform(args: ServAPIArgs<void>): ServAPIRetn<string> {
        return API_SUCCEED(STRING_VALUE);
    }

    apiRetnPlusTransform(args: ServAPIArgs<number>): ServAPIRetn<number> {
        return API_SUCCEED(args);
    }

    apiCustomTimeout(args: ServAPIArgs): ServAPIRetn {
        return API_SUCCEED(new Promise((resolve, reject) => {
            setTimeout(resolve, 100);
        }));
    }
    
    apiDefaultTimeout(args: ServAPIArgs): ServAPIRetn {
        return API_SUCCEED(new Promise((resolve, reject) => {
            setTimeout(resolve, 1000);
        }));
    }
    
    apiNeverTimeout<T = any>(args: ServAPIArgs<T>): ServAPIRetn<T> {
        return API_SUCCEED(new Promise((resolve, reject) => {
            //
        }));
    }

    eventNoArgs: ServEventer;
    
    eventWithArgs: ServEventer<string>;
}

@anno.impl()
export class Test1Impl extends Test1 {
    apiNoArgsNoRetn(): ServAPIRetn<void> {
        return API_SUCCEED();
    }

    apiNoArgsWithRetn(): ServAPIRetn<string> {
        return API_SUCCEED(STRING_VALUE);
    }

    apiWithArgsNoRetn(args: ServAPIArgs<string>): ServAPIRetn<void> {
        expect(args).toBe(STRING_VALUE);
        return API_SUCCEED();
    }

    apiWithArgsWithRetn(args: ServAPIArgs<string>): ServAPIRetn<string> {
        return API_SUCCEED(args);
    }

    apiWithAny<T = any>(args: ServAPIArgs<T>): ServAPIRetn<T> {
        return API_SUCCEED(args);
    }

    apiCallTransform(args: ServAPIArgs<string>): ServAPIRetn<void> {
        return API_SUCCEED();
    }

    apiRetnTransform(args: ServAPIArgs<void>): ServAPIRetn<string> {
        return API_SUCCEED(STRING_VALUE);
    }

    apiRetnPlusTransform(args: ServAPIArgs<number>): ServAPIRetn<number> {
        return API_SUCCEED(args);
    }

    eventNoArgs: ServEventer;
    
    eventWithArgs: ServEventer<string>;
}

@anno.impl()
export class ApiACLTestImpl extends ApiACLTest  {
    privateAPI(): ServAPIRetn {
        return API_SUCCEED();
    }

    defaultPublicAPI(): ServAPIRetn {
        return API_SUCCEED();
    }

    publicAPI(): ServAPIRetn {
        return API_SUCCEED();
    }
}

@anno.impl()
export class ServACLTestImpl extends ServACLTest {
    privateAPI(): ServAPIRetn {
        return API_SUCCEED();
    }

    defaultPublicAPI(): ServAPIRetn {
        return API_SUCCEED();
    }

    publicAPI(): ServAPIRetn {
        return API_SUCCEED();
    }
}
