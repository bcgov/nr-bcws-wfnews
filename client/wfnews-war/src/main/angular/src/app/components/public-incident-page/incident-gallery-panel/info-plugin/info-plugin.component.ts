import { LgQuery } from 'lightgallery/lgQuery';
import { LightGallery } from 'lightgallery/lightgallery';
import { infoSettings, InfoPluginSettings } from './info-plugin-settings.component';


declare let document: any;

export default class InfoPlugin {
    core: LightGallery;
    settings: InfoPluginSettings;
    private $LG!: LgQuery;
    constructor(instance: LightGallery, $LG: LgQuery) {
        // get lightGallery core plugin instance
        this.core = instance;
        this.$LG = $LG;

        // extend module default settings with lightGallery core settings
        this.settings = { ...infoSettings, ...this.core.settings };

        return this;
    }

    public init(): void {
        let infoButton = '';
        if (this.settings.info) {
            infoButton = `<button type="button" class="lg-image-information lg-icon"><span class="material-icons" style="font-size:36px!important">info</span></button>`;
            this.core.$toolbar.append(infoButton);
            this.information();
        }
    }

    private requestFullscreen(): void {
        const el = document.documentElement;
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }
    }

    private exitFullscreen(): void {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    private information(): void {
        this.core.outer
            .find('.lg-image-information')
            .first()
            .on('click.lg', () => {
                this.core.outer.append(`<div id="property-list" class="property-list">
                    <h2> Info <span class="close-button"><mat-icon class="mat-icon notranslate material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font">close</mat-icon></span></h2>
                    <h4 style="font-weight: normal;">Image title</h4>
                    <div style="font-weight: 700;">${this.settings.infoData.imageTitle}</div>
                    <h4 style="font-weight: normal;">Filename</h4>
                    <div style="font-weight: 700;">${this.settings.infoData.filename}</div>
                    <h4 style="font-weight: normal;">Date uploaded</h4>
                    <div style="font-weight: 700;">${this.settings.infoData.dateUploaded}</div>
                </div>`,
                );
            });
    }

    closeGallery(): void {
        this.core.outer.find('.property-list').remove();
    }

    destroy(): void {
        this.$LG(document).off(
            `fullscreenchange.lg.global${this.core.lgId} 
            webkitfullscreenchange.lg.global${this.core.lgId} 
            mozfullscreenchange.lg.global${this.core.lgId} 
            MSFullscreenChange.lg.global${this.core.lgId}`,
        );
    }
}