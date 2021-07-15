import { anno } from 'servkit';
import { MessageService } from './message.service';

@anno.decl({
    id: 'com.example.message222.service',
    version: '1.0.0',
})
export class Message2Service extends MessageService {}
