import * as advisories from 'raw-loader!./advisories.md'
import * as campfires from 'raw-loader!./campfires.md'
import * as currentStats from 'raw-loader!./current-stats.md'
import * as helpContents from 'raw-loader!./help-contents.md'
import * as latestNews from 'raw-loader!./latest-news.md'
import * as openFiresCategory2 from 'raw-loader!./open-fires-category-2.md'
import * as openFiresCategory3 from 'raw-loader!./open-fires-category-3.md'
import * as reportAFire from 'raw-loader!./report-a-fire.md'
import * as weather from 'raw-loader!./weather.md'
import * as wildfireLearning from 'raw-loader!./wildfire-learning.md'
import * as wildfireMap from 'raw-loader!./wildfire-map.md'
import * as dangerRating from 'raw-loader!./danger-rating.md'
import * as responseTypesAndStagesOfControl from 'raw-loader!./response-types-and-stages-of-control.md'
import * as serviceCrews from 'raw-loader!./service-crews.md'
import * as helpWildfireLearning from 'raw-loader!./help-wildfire-learning.md'
import * as firesmart from 'raw-loader!./firesmart.md'
import * as evacOrdersAndALerts from 'raw-loader!./evacuations-orders-and-alerts.md'

import * as uavs from 'raw-loader!./uavs.md'
import * as areaRestrictions from 'raw-loader!./area-restrictions.md'
import * as usingTheAppVideos from 'raw-loader!./using-the-app-videos.md'
import * as weatherIndices from 'raw-loader!./weather-indices.md'


let _doc = {}
function declareDoc( id, title, content ) {
    _doc[ id ] = { id, title, content }
}

declareDoc( 'wildfireLearning', 'Wildfire Learning', wildfireLearning )
    declareDoc( 'campFires', 'Category 1 Campfires', campfires )
    declareDoc( 'openFiresCategory2', 'Category 2 Open Fires', openFiresCategory2 )
    declareDoc( 'openFiresCategory3', 'Category 3 Open Fires', openFiresCategory3 )
    declareDoc( 'weather', 'Weather', weather )
    declareDoc( 'dangerRating', 'Danger Rating', dangerRating )
    declareDoc( 'responseTypesAndStagesOfControl', 'Response Types and Stages of Control', responseTypesAndStagesOfControl )
    declareDoc( 'serviceCrews', 'Wildfire Crews', serviceCrews )
    declareDoc( 'firesmart', 'FireSmart', firesmart )
    declareDoc( 'evacOrdersAndALerts', 'Evacuation Orders and Alerts', evacOrdersAndALerts )

    declareDoc( 'uavs', 'UAVs / Drones', uavs )
    declareDoc( 'areaRestrictions', 'Area Restrictions', areaRestrictions )
declareDoc( 'helpContents', 'Help', helpContents )
    declareDoc( 'wildfireMap', 'Wildfire Map', wildfireMap )
    declareDoc( 'latestNews', 'Latest News', latestNews )
    declareDoc( 'advisories', 'Current Notices', advisories )
    declareDoc( 'currentStats', 'Current Stats', currentStats )
declareDoc('reportAFire', 'Report a Fire', reportAFire)
    declareDoc('weatherIndices', 'Weather Indices', weatherIndices)
    
    declareDoc( 'helpWildfireLearning', 'Wildfire Learning', helpWildfireLearning )
    declareDoc( 'usingTheAppVideos', 'Using the App Videos', usingTheAppVideos )

export default _doc