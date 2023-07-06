import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AppConfigService } from "src/app/services/app-config.service";
import doc from './docs';

const TOPICS_SEEN_KEY: string = 'topicsSeen'

const topicsAlreadySeen = {
    advisories: true,
    campFires: true,
    currentStats: true,
    helpContents: true,
    latestNews: true,
    openFiresCategory2: true,
    openFiresCategory3: true,
    reportAFire: true,
    weather: true,
    wildfireMap: true,
    dangerRating: true,
    responseTypesAndStagesOfControl: true,
    serviceCrews: true,
    helpWildfireLearning: true,
    firesmart: true,
    evacOrdersAndAlerts: true
}

let topicsSeenOverride = {}

@Injectable()
export class HelpDocumentService {

    private marked
    private resource
    private announcements: Promise<Announcement[]>
    private currentAnnouncement: string
    private announcementsLoaded: Promise<any>

    constructor(
        private sanitizer: DomSanitizer,
        private appConfigService: AppConfigService,
        private http: HttpClient,
    ) {
        const self = this

        this.marked = window[ 'marked' ]

        var renderer: { [ key: string ]: any } = {}

        renderer.link = function ( href, title, text ) {
            // console.log( href )
            if ( href.startsWith( '@' ) ) return `
<div class="help-link" onclick="markdownEventEmitter.emit('click',{topic:'${ href.slice( 1 ) }'})">
    <span>${ text }</span>
    ${ newMarker( href.slice( 1 ) ) }
    <span class="fill"></span>
    <i class="material-icons">keyboard_arrow_right</i>
</div>
`
            if ( href.startsWith( '$' ) ) return `
<a href="${ self.resource[ href.slice( 1 ) ] }" alt="${ title }" target="_blank" class="external-link">${ text }</a>
`
            if ( href.startsWith( '#' ) ) return `
<a href="${ href.slice( 1 ) }" alt="${ title }" target="_blank" class="external-link">${ text }</a>
`
            return false
        }

        renderer.image = function ( href, title, text ) {
            // console.log( href )
            if ( href.startsWith( '%' ) )
                return `<i class="material-icons">${ href.slice( 1 ) }</i>`

            return false
        }

        renderer.paragraph = function ( text ) {
            var m = text.match( /^[{][:](.*)[:][}]$/ )
            if ( m ) {
                if ( m[ 1 ] ) return `<div class="${ m[ 1 ] }">`
                return '</div>'
            }

            m = text.match( /^[{][:](.+)[:][}]\s*([^]+)$/ )
            if ( m ) {
                return `<p class="${ m[ 1 ] }">${ m[ 2 ] }</p>`
            }

            return false
        }

        renderer.listitem = function ( text ) {
            var m = text.match( /^[<]p[>]([<]img[^>]+[>])([^]+)$/ )
            if ( m )
                return `<li><div class="image">${ m[ 1 ] }</div><p>${ m[ 2 ] }</li>`

            return false
        }

        this.marked.use( { renderer } )


        this.announcementsLoaded = this.getAnnouncments().then( function ( ans ) {
            let ps = ans.map( function ( a ) {
                let id = 'announcement-' + a.id
                doc[ id ] = {
                    id: id,
                    title: a.title,
                }

                if ( a.new != null )
                    topicsSeenOverride[ id ] = !a.new

                if ( a.current )
                    self.currentAnnouncement = id

                return a.getDocument().then( function ( content ) {
                    doc[ id ].content = content
                } )
            } )

            doc[ 'announcements' ] = {
                id: 'announcements',
                title: 'App Info',
                content: '{:table-of-contents:}\n\n' + ans.map( function ( a ) {
                    return `- [${ a.title }]( @announcement-${ a.id } )`
                } ).join( '\n' )
            }

            return Promise.all( ps )
        } )

        function newMarker( topic: string ){
            if ( self.isTopicSeen( topic ) ) return ''
            return '<span class="new-marker">New</span>'
        }

        this.hasUnseenAnnouncements().then( function ( unseen ) {
            topicsSeenOverride[ 'announcements' ] = !unseen
        } )
    }

    getDocument( topic: string ) {
        if ( !this.resource )
            this.resource = this.appConfigService.getAppResourcesConfig()

        try {
            let html = doc[ topic ].html
            if ( !html )
                html = this.marked( doc[ topic ].content )

            return {
                html: this.sanitizer.bypassSecurityTrustHtml( html ),
                title: doc[ topic ].title
            }
        }
        catch ( e ) {
            return {
                html: 'Topic "' + topic + '" had a problem:\n' + e,
                title: topic + ' failed'
            }
        }
    }

    getAnnouncments(): Promise<Announcement[]> {
        const self = this

        if ( !this.announcements )
            this.announcements = this.appConfigService.loadAppConfig()
                .then( function () {
                    return self.http.get( `${ self.appConfigService.getAppResourcesConfig().announcementsUrl }/index.json?_=${ Math.random() }` ).toPromise()
                } )
                .then( function ( ans: Announcement[] ) {
                    ans.sort( function ( a, b ) {
                        return b.id - a.id
                    } )

                    return ans.map( function ( a ) {
                        a.getDocument = function () {
                            return self.http.get( `${ self.appConfigService.getAppResourcesConfig().announcementsUrl }/${ a.id }.md`, { responseType: 'text' } ).toPromise()
                                .then( function ( text: string ) {
                                    return text
                                } )
                        }

                        a.isSeen = function () {
                            return self.isTopicSeen( 'announcement-' + a.id )
                        }

                        return a
                    } )
                } )

        return this.announcements
    }

    hasUnseenAnnouncements(): Promise<boolean> {
        return this.getAnnouncments()
            .then( function ( ans ) {
                return ans.some( function ( a ) {
                    return !a.isSeen()
                } )
            } )
    }

    setTopicSeen( topic: string, seen: boolean = true ): void {
        var topicsSeen = JSON.parse( localStorage.getItem( TOPICS_SEEN_KEY ) || '{}' )
        topicsSeen[ topic ] = seen
        localStorage.setItem( TOPICS_SEEN_KEY, JSON.stringify( topicsSeen ) )

        this.hasUnseenAnnouncements().then( function ( unseen ) {
            topicsSeenOverride[ 'announcements' ] = !unseen
        } )
    }

    isTopicSeen( topic: string ): boolean {
        var topicsSeen = { ...topicsAlreadySeen, ...JSON.parse( localStorage.getItem( TOPICS_SEEN_KEY ) || '{}' ), ...topicsSeenOverride }
        return !!topicsSeen[ topic ]
    }

    hasCurrentAnnouncement(): Promise<string> {
        return this.announcementsLoaded
            .then( ( ans ) => {
                if ( this.currentAnnouncement ){
                    let currentVersionNumber = this.appConfigService.getConfig()['application']['version'].replace('-SNAPSHOT','').split('.').join("");
                    let announcementVersion = this.currentAnnouncement.replace('announcement-','')
                    // Don't show the message if they are at the latest version already
                    if (Number(currentVersionNumber) < Number(announcementVersion)) {
                        return this.currentAnnouncement
                    }
                }

                throw Error( 'no current announcement' )
            } )
    }
}

export interface Announcement {
    id: number
    // published: string,
    title: string
    new?: boolean
    current?: boolean
    getDocument(): Promise<string>
    isSeen(): boolean;
}
