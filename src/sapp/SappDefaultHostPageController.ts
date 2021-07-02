import { Sapp } from './Sapp';
import { SappController } from './SappController';
import { SappCreateOptions, SappLayoutOptions } from './SappMGR';
import { EServChannel } from '../session/channel/ServChannel';
import { ServSessionConfig } from '../session/ServSession';
import { SappCloseResult } from './service/m/SappLifecycle';

interface LayoutShowHide {
    options: SappLayoutOptions;
    doStart?: ((app: Sapp) => void);
    doClose?: ((app: Sapp) => void);
    doShow?: ((app: Sapp) => void);
    doHide?: ((app: Sapp) => void);
}

export class SappDefaultHostPageController extends SappController {
    protected layout: LayoutShowHide = { options: {} };

    async doStart() {
        const layout = this.layout;
        if (layout.doStart) {
            layout.doStart(this.app);
        }
    }

    async doClose(result?: SappCloseResult) {
        const layout = this.layout;
        if (layout.doClose) {
            layout.doClose(this.app);
        }
    }

    async doShow() {
        const layout = this.layout;
        if (layout.doShow) {
            layout.doShow(this.app);
        }
    }

    async doHide() {
        const layout = this.layout;
        if (layout.doHide) {
            layout.doHide(this.app);
        }
    }

    protected doCloseAfterAspect() {
        super.doCloseAfterAspect();
        this.layout = { options: {} };
    }

    protected setupLayout(options: SappLayoutOptions) {
        this.layout = { 
            options,
            doStart: options.doStart,
            doClose: options.doClose,
            doShow: options.doShow,
            doHide: options.doHide,
        };
    }

    protected resolveSessionChannelConfig(options: SappCreateOptions): ServSessionConfig['channel'] {
        return {
            type: EServChannel.WINDOW,
            config: {
            },
        };
    }
}
