import { ServServiceServerACLResolver } from '../service/ServServiceServerACLResolver';
import { Sapp } from './Sapp';

export class SappACLResolver extends ServServiceServerACLResolver {
    protected app: Sapp;

    constructor(app: Sapp) {
        super();
        this.app = app;
    }

    init(): Promise<void> {
        return Promise.resolve();
    }
}
