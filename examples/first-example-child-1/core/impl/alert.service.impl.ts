import { AlertService } from '@example/first-children-decl';
import { anno } from 'servkit';

@anno.impl()
export class AlertServiceImpl extends AlertService {

    async alert(message: string) {
        alert(message);
    }
}
