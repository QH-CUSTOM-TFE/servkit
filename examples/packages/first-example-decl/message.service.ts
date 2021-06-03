import { anno, API_UNSUPPORT, ServAPIRetn, ServService } from 'servkit';

@anno.decl({
    id: 'com.example.message.service',
    version: '1.0.0',
})
export class MessageService extends ServService {

    @anno.decl.api()
    info(message: string): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    success(message: string): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    error(message: string): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

}
