import { ServService, ServAPIRetn, ServAPIArgs } from '../../../service/ServService';
export interface SappShowParams {
    force?: boolean;
    data?: any;
}
export interface SappHideParams {
    force?: boolean;
    data?: any;
}
export interface SappCloseResult {
    data?: any;
    error?: any;
}
export declare class SappLifecycle extends ServService {
    onStart(): ServAPIRetn;
    getStartData(): ServAPIRetn<any>;
    show(params?: ServAPIArgs<SappShowParams>): ServAPIRetn;
    hide(params?: ServAPIArgs<SappHideParams>): ServAPIRetn;
    close(result?: ServAPIArgs<SappCloseResult>): ServAPIRetn;
}
