import { ServService, ServAPIRetn, ServAPIArgs } from '../../../service/ServService';
export interface SappShowParams {
    force?: boolean;
    data?: any;
}
export interface SappHideParams {
    force?: boolean;
    data?: any;
}
export interface SappAuthParams {
    token: string;
    [property: string]: any;
}
export interface SappCloseResult {
    data?: any;
    error?: any;
}
export declare class SappLifecycle extends ServService {
    auth(params: SappAuthParams): ServAPIRetn;
    onStart(): ServAPIRetn;
    getStartData(): ServAPIRetn<any>;
    show(params?: ServAPIArgs<SappShowParams>): ServAPIRetn<boolean>;
    hide(params?: ServAPIArgs<SappHideParams>): ServAPIRetn<boolean>;
    close(result?: ServAPIArgs<SappCloseResult>): ServAPIRetn<boolean>;
}
