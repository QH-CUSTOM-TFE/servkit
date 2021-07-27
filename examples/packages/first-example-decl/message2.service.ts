import { anno, API_UNSUPPORT, ServAPIRetn } from 'servkit';
import { ImessageServiceType, MessageService } from './message.service';

@anno.decl({
    id: 'com.example.message2.service',
    version: '1.0.0',
})
export class Message2Service extends MessageService {

    @anno.decl.api()
    info2(content: ImessageServiceType): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

}
