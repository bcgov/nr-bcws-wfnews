export class FakeAppConfigService {
    getConfig() {
        return {
            'application': {
                'acronym': 'WFONE-PUBLIC-MOBILE',
                'version': '1.1.0-SNAPSHOT',
                'baseUrl': 'http://localhost:9200/',
                'environment': 'LOCAL',
                'buildNumber': '0000'
            }
        };

    }
}
