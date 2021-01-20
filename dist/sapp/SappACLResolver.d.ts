import { ServServiceServerACLResolver } from '../service/ServServiceServerACLResolver';
import { Sapp } from './Sapp';
export declare class SappACLResolver extends ServServiceServerACLResolver {
    protected app: Sapp;
    constructor(app: Sapp);
    init(): Promise<void>;
}
