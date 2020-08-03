import {
    anno,
    API_SUCCEED,
    ServAPIArgs,
    ServAPIRetn,
    ServEventer,
} from '../../../src';
import { Test, Test1 } from '../decl/service';
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

    eventNoArgs: ServEventer;
    
    eventWithArgs: ServEventer<string>;
}
