import {expect} from 'chai';
import {spec} from 'modules/adtelligentBidAdapter';
import {newBidder} from 'src/adapters/bidderFactory';

const ENDPOINT = 'https://hb.adtelligent.com/auction/';

const DISPLAY_REQUEST = {
  'bidder': 'adtelligent',
  'params': {
    'aid': 12345
  },
  'bidderRequestId': '7101db09af0db2',
  'auctionId': '2e41f65424c87c',
  'adUnitCode': 'adunit-code',
  'bidId': '84ab500420319d',
  'sizes': [300, 250]
};

const VIDEO_REQUEST = {
  'bidder': 'adtelligent',
  'mediaTypes': {
    'video': {}
  },
  'params': {
    'aid': 12345
  },
  'bidderRequestId': '7101db09af0db2',
  'auctionId': '2e41f65424c87c',
  'adUnitCode': 'adunit-code',
  'bidId': '84ab500420319d',
  'sizes': [[480, 360], [640, 480]]
};

const SERVER_VIDEO_RESPONSE = {
  'source': {'aid': 12345, 'pubId': 54321},
  'bids': [{
    'vastUrl': 'https://rtb.adtelligent.com/vast/?adid=44F2AEB9BFC881B3',
    'requestId': '2e41f65424c87c',
    'url': '44F2AEB9BFC881B3',
    'creative_id': 342516,
    'cmpId': 342516,
    'height': 480,
    'cur': 'USD',
    'width': 640,
    'cpm': 0.9
  }
  ]
};

const SERVER_DISPLAY_RESPONSE = {
  'source': {'aid': 12345, 'pubId': 54321},
  'bids': [{
    'ad': '<!-- Creative -->',
    'requestId': '2e41f65424c87c',
    'creative_id': 342516,
    'cmpId': 342516,
    'height': 250,
    'cur': 'USD',
    'width': 300,
    'cpm': 0.9
  }],
  'cookieURLs': ['link1', 'link2']
};
const SERVER_DISPLAY_RESPONSE_WITH_MIXED_SYNCS = {
  'source': {'aid': 12345, 'pubId': 54321},
  'bids': [{
    'ad': '<!-- Creative -->',
    'requestId': '2e41f65424c87c',
    'creative_id': 342516,
    'cmpId': 342516,
    'height': 250,
    'cur': 'USD',
    'width': 300,
    'cpm': 0.9
  }],
  'cookieURLs': ['link1', 'link2'],
  'cookieURLSTypes': ['image', 'iframe']
};

const videoBidderRequest = {
  bidderCode: 'bidderCode',
  bids: [{mediaTypes: {video: {}}, bidId: '2e41f65424c87c'}]
};

const displayBidderRequest = {
  bidderCode: 'bidderCode',
  bids: [{bidId: '2e41f65424c87c'}]
};

const displayBidderRequestWithGdpr = {
  bidderCode: 'bidderCode',
  bids: [{bidId: '2e41f65424c87c'}],
  gdprConsent: {
    gdprApplies: true,
    consentString: 'test'
  }
};

const videoEqResponse = [{
  vastUrl: 'https://rtb.adtelligent.com/vast/?adid=44F2AEB9BFC881B3',
  requestId: '2e41f65424c87c',
  creativeId: 342516,
  mediaType: 'video',
  netRevenue: true,
  currency: 'USD',
  height: 480,
  width: 640,
  ttl: 3600,
  cpm: 0.9
}];

const displayEqResponse = [{
  requestId: '2e41f65424c87c',
  creativeId: 342516,
  mediaType: 'display',
  netRevenue: true,
  currency: 'USD',
  ad: '<!-- Creative -->',
  height: 250,
  width: 300,
  ttl: 3600,
  cpm: 0.9
}];

describe('adtelligentBidAdapter', function () { // todo remove only
  const adapter = newBidder(spec);

  describe('user syncs as image', function () {
    it('should be returned if pixel enabled', function () {
      const syncs = spec.getUserSyncs({pixelEnabled: true}, [{body: SERVER_DISPLAY_RESPONSE_WITH_MIXED_SYNCS}]);

      expect(syncs.map(s => s.url)).to.deep.equal([SERVER_DISPLAY_RESPONSE_WITH_MIXED_SYNCS.cookieURLs[0]]);
      expect(syncs.map(s => s.type)).to.deep.equal(['image']);
    })
  })

  describe('user syncs as iframe', function () {
    it('should be returned if iframe enabled', function () {
      const syncs = spec.getUserSyncs({iframeEnabled: true}, [{body: SERVER_DISPLAY_RESPONSE_WITH_MIXED_SYNCS}]);

      expect(syncs.map(s => s.url)).to.deep.equal([SERVER_DISPLAY_RESPONSE_WITH_MIXED_SYNCS.cookieURLs[1]]);
      expect(syncs.map(s => s.type)).to.deep.equal(['iframe']);
    })
  })

  describe('user syncs with both types', function () {
    it('should be returned if pixel and iframe enabled', function () {
      const syncs = spec.getUserSyncs({
        iframeEnabled: true,
        pixelEnabled: true
      }, [{body: SERVER_DISPLAY_RESPONSE_WITH_MIXED_SYNCS}]);

      expect(syncs.map(s => s.url)).to.deep.equal(SERVER_DISPLAY_RESPONSE_WITH_MIXED_SYNCS.cookieURLs);
      expect(syncs.map(s => s.type)).to.deep.equal(SERVER_DISPLAY_RESPONSE_WITH_MIXED_SYNCS.cookieURLSTypes);
    })
  })

  describe('user syncs', function () {
    it('should not be returned if pixel not set', function () {
      const syncs = spec.getUserSyncs({}, [{body: SERVER_DISPLAY_RESPONSE_WITH_MIXED_SYNCS}]);

      expect(syncs).to.be.empty;
    })
  })

  describe('inherited functions', function () {
    it('exists and is a function', function () {
      expect(adapter.callBids).to.exist.and.to.be.a('function');
    });
  });

  describe('isBidRequestValid', function () {
    it('should return true when required params found', function () {
      expect(spec.isBidRequestValid(VIDEO_REQUEST)).to.equal(12345);
    });

    it('should return false when required params are not passed', function () {
      let bid = Object.assign({}, VIDEO_REQUEST);
      delete bid.params;
      expect(spec.isBidRequestValid(bid)).to.equal(undefined);
    });
  });

  describe('buildRequests', function () {
    let videoBidRequests = [VIDEO_REQUEST];
    let displayBidRequests = [DISPLAY_REQUEST];
    let videoAndDisplayBidRequests = [DISPLAY_REQUEST, VIDEO_REQUEST];

    const displayRequest = spec.buildRequests(displayBidRequests, {});
    const videoRequest = spec.buildRequests(videoBidRequests, {});
    const videoAndDisplayRequests = spec.buildRequests(videoAndDisplayBidRequests, {});

    it('sends bid request to ENDPOINT via GET', function () {
      expect(videoRequest.method).to.equal('GET');
      expect(displayRequest.method).to.equal('GET');
      expect(videoAndDisplayRequests.method).to.equal('GET');
    });

    it('sends bid request to correct ENDPOINT', function () {
      expect(videoRequest.url).to.equal(ENDPOINT);
      expect(displayRequest.url).to.equal(ENDPOINT);
      expect(videoAndDisplayRequests.url).to.equal(ENDPOINT);
    });

    it('sends correct video bid parameters', function () {
      const bid = Object.assign({}, videoRequest.data);
      delete bid.domain;

      const eq = {
        callbackId: '84ab500420319d',
        ad_type: 'video',
        aid: 12345,
        sizes: '480x360,640x480'
      };

      expect(bid).to.deep.equal(eq);
    });

    it('sends correct display bid parameters', function () {
      const bid = Object.assign({}, displayRequest.data);
      delete bid.domain;

      const eq = {
        callbackId: '84ab500420319d',
        ad_type: 'display',
        aid: 12345,
        sizes: '300x250'
      };

      expect(bid).to.deep.equal(eq);
    });

    it('sends correct video and display bid parameters', function () {
      const bid = Object.assign({}, videoAndDisplayRequests.data);
      delete bid.domain;

      const eq = {
        callbackId: '84ab500420319d',
        ad_type: 'display',
        aid: 12345,
        sizes: '300x250',
        callbackId2: '84ab500420319d',
        ad_type2: 'video',
        aid2: 12345,
        sizes2: '480x360,640x480'
      };

      expect(bid).to.deep.equal(eq);
    });
  });

  describe('interpretResponse', function () {
    let serverResponse;
    let bidderRequest;
    let eqResponse;

    afterEach(function () {
      serverResponse = null;
      bidderRequest = null;
      eqResponse = null;
    });

    it('should get correct video bid response', function () {
      serverResponse = SERVER_VIDEO_RESPONSE;
      bidderRequest = videoBidderRequest;
      eqResponse = videoEqResponse;

      bidServerResponseCheck();
    });

    it('should get correct display bid response', function () {
      serverResponse = SERVER_DISPLAY_RESPONSE;
      bidderRequest = displayBidderRequest;
      eqResponse = displayEqResponse;

      bidServerResponseCheck();
    });

    it('should set gdpr data correctly', function () {
      const builtRequestData = spec.buildRequests([DISPLAY_REQUEST], displayBidderRequestWithGdpr);

      expect(builtRequestData.data.gdpr).to.be.equal(1);
      expect(builtRequestData.data.gdpr_consent).to.be.equal(displayBidderRequestWithGdpr.gdprConsent.consentString);
    });

    function bidServerResponseCheck() {
      const result = spec.interpretResponse({body: serverResponse}, {bidderRequest});

      expect(result).to.deep.equal(eqResponse);
    }

    function nobidServerResponseCheck() {
      const noBidServerResponse = {bids: []};
      const noBidResult = spec.interpretResponse({body: noBidServerResponse}, {bidderRequest});

      expect(noBidResult.length).to.equal(0);
    }

    it('handles video nobid responses', function () {
      bidderRequest = videoBidderRequest;

      nobidServerResponseCheck();
    });

    it('handles display nobid responses', function () {
      bidderRequest = displayBidderRequest;

      nobidServerResponseCheck();
    });
  });
});
