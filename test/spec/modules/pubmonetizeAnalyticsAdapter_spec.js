import pubmonetizeAnalyticsAdapter from 'modules/pubmonetizeAnalyticsAdapter.js';
import {testSend} from 'modules/pubmonetizeAnalyticsAdapter.js';
import {expect} from 'chai';
import adapterManager from 'src/adapterManager.js';
import {server} from 'test/mocks/xhr.js';

let events = require('src/events');
let constants = require('src/constants.json');

describe('Pubmonetize analytics adapter', function () {
  beforeEach(function () {
    sinon.stub(events, 'getEvents').returns([]);
  });

  afterEach(function () {
    events.getEvents.restore();
  });

  describe('track', function () {
    let initOptions = {
      pubId: 123,
    };

    let auctionInit = {
      'auctionId': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
      'timestamp': 1589707613899,
      'auctionStatus': 'inProgress',
      'adUnits': [
        {
          'code': 'div-gpt-ad-1533155193780-2',
          'mediaTypes': {
            'banner': {
              'sizes': [
                [
                  300,
                  250
                ]
              ]
            }
          },
          'bids': [
            {
              'bidder': 'luponmedia',
              'params': {
                'siteId': 303522,
                'keyId': '4o2c4'
              },
              'crumbs': {
                'pubcid': 'aebbdfa9-3e0f-49b6-ad87-437aaa88db2d'
              }
            }
          ],
          'sizes': [
            [
              300,
              250
            ]
          ],
          'transactionId': 'f68c54c2-0814-4ae5-95f5-09f6dd9dc1ef'
        }
      ],
      'adUnitCodes': [
        'div-gpt-ad-1533155193780-2'
      ],
      'labels': [
        'BA'
      ],
      'bidderRequests': [
        {
          'bidderCode': 'luponmedia',
          'auctionId': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
          'bidderRequestId': '18c49b05a23645',
          'bids': [
            {
              'bidder': 'luponmedia',
              'params': {
                'siteId': 303522,
                'keyId': '4o2c4'
              },
              'crumbs': {
                'pubcid': 'aebbdfa9-3e0f-49b6-ad87-437aaa88db2d'
              },
              'mediaTypes': {
                'banner': {
                  'sizes': [
                    [
                      300,
                      250
                    ]
                  ]
                }
              },
              'adUnitCode': 'div-gpt-ad-1533155193780-2',
              'transactionId': 'f68c54c2-0814-4ae5-95f5-09f6dd9dc1ef',
              'sizes': [
                [
                  300,
                  250
                ]
              ],
              'bidId': '284f8e1469246a',
              'bidderRequestId': '18c49b05a23645',
              'auctionId': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
              'src': 'client',
              'bidRequestsCount': 1,
              'bidderRequestsCount': 1,
              'bidderWinsCount': 0,
              'schain': {
                'ver': '1.0',
                'complete': 1,
                'nodes': [
                  {
                    'asi': 'novi.ba',
                    'sid': '199424',
                    'hp': 1
                  }
                ]
              }
            }
          ],
          'auctionStart': 1589707613899,
          'timeout': 2000,
          'refererInfo': {
            'referer': 'https://test.com/article/176067',
            'reachedTop': true,
            'numIframes': 0,
            'stack': [
              'https://test.com/article/176067'
            ]
          },
          'gdprConsent': {}
        }
      ],
      'noBids': [],
      'bidsReceived': [],
      'winningBids': [],
      'timeout': 2000,
      'config': {
        'pubId': 4444,
      }
    };

    // requests & responses
    let bidRequest = {
      'bidderCode': 'luponmedia',
      'auctionId': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
      'bidderRequestId': '18c49b05a23645',
      'bids': [
        {
          'bidder': 'luponmedia',
          'params': {
            'siteId': 303522,
            'keyId': '4o2c4'
          },
          'crumbs': {
            'pubcid': 'aebbdfa9-3e0f-49b6-ad87-437aaa88db2d'
          },
          'mediaTypes': {
            'banner': {
              'sizes': [
                [
                  300,
                  250
                ]
              ]
            }
          },
          'adUnitCode': 'div-gpt-ad-1533155193780-2',
          'transactionId': 'f68c54c2-0814-4ae5-95f5-09f6dd9dc1ef',
          'sizes': [
            [
              300,
              250
            ]
          ],
          'bidId': '284f8e1469246a',
          'bidderRequestId': '18c49b05a23645',
          'auctionId': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
          'src': 'client',
          'bidRequestsCount': 1,
          'bidderRequestsCount': 1,
          'bidderWinsCount': 0,
        },
        {
          'bidder': 'luponmedia',
          'params': {
            'siteId': 303522,
            'keyId': '4o2c5'
          },
          'crumbs': {
            'pubcid': 'aebbdfa9-3e0f-49b6-ad87-437aaa88db2d'
          },
          'mediaTypes': {
            'banner': {
              'sizes': [
                [
                  300,
                  250
                ]
              ]
            }
          },
          'adUnitCode': 'div-gpt-ad-1533155193780-3',
          'transactionId': 'f68c54c2-0814-4ae5-95f5-09f6dd9dc1ef',
          'sizes': [
            [
              300,
              250
            ]
          ],
          'bidId': '284f8e1469246b',
          'bidderRequestId': '18c49b05a23645',
          'auctionId': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
          'src': 'client',
          'bidRequestsCount': 1,
          'bidderRequestsCount': 1,
          'bidderWinsCount': 0,
        }
      ],
      'auctionStart': 1589707613899,
      'timeout': 2000,
      'refererInfo': {
        'referer': 'https://test.com/article/176067',
        'reachedTop': true,
        'numIframes': 0,
        'stack': [
          'https://test.com/article/176067'
        ]
      },
      'start': 1589707613908
    };

    let bidResponse = {
      'bidderCode': 'luponmedia',
      'width': 300,
      'height': 250,
      'statusMessage': 'Bid available',
      'adId': '3b40e0da8968f5',
      'requestId': '284f8e1469246a',
      'mediaType': 'banner',
      'source': 'client',
      'cpm': 0.43,
      'creativeId': '443801010',
      'currency': 'USD',
      'netRevenue': false,
      'ttl': 300,
      'referrer': '',
      'ad': "<a href='https://novi.ba' target='_blank' style='position:absolute; width:300px; height:250px; z-index:5;'> </a><iframe src='https://lupon.media/vijestiba/300x250new/index.html' height='250' width='300' scrolling='no' frameborder='0'></iframe>",
      'originalCpm': '0.43',
      'originalCurrency': 'USD',
      'auctionId': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
      'responseTimestamp': 1589707615188,
      'requestTimestamp': 1589707613908,
      'bidder': 'luponmedia',
      'adUnitCode': 'div-gpt-ad-1533155193780-2',
      'timeToRespond': 1280,
      'pbLg': '0.00',
      'pbMg': '0.40',
      'pbHg': '0.43',
      'pbAg': '0.40',
      'pbDg': '0.43',
      'pbCg': '0.43',
      'size': '300x250',
      'adserverTargeting': {
        'hb_bidder': 'luponmedia',
        'hb_adid': '3b40e0da8968f5',
        'hb_pb': '0.43',
        'hb_size': '300x250',
        'hb_source': 'client',
        'hb_format': 'banner'
      }
    };

    // what we expect after general auction
    let expectedAfterBid = {
      'publisher_id': 123,
      'auction_id': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
      'screen_resolution': window.screen.width + 'x' + window.screen.height,
      'device_type': 'desktop',
      'geo': null,
      'events': [{
        'auction_id': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
        'type': 'TIMEOUT',
        'bidder_code': 'luponmedia',
        'bidder_request_id': '18c49b05a23645',
        'event_timestamp': 1589707613908,
        'bid_gpt_codes': {
          'div-gpt-ad-1533155193780-2': [[300, 250]],
          'div-gpt-ad-1533155193780-3': [[300, 250]]
        }
      }]
    };

    // what we expect after timeout
    let expectedAfterTimeout = {
      'publisher_id': 123,
      'auction_id': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
      'screen_resolution': window.screen.width + 'x' + window.screen.height,
      'device_type': 'desktop',
      'geo': null,
      'events': [{
        'auction_id': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
        'type': 'TIMEOUT',
        'bidder_code': 'luponmedia',
        'bidder_request_id': '18c49b05a23645',
        'event_timestamp': 1589707613908,
        'bid_gpt_codes': {
          'div-gpt-ad-1533155193780-2': [[300, 250]],
          'div-gpt-ad-1533155193780-3': [[300, 250]]
        }
      }]
    };

    // lets simulate that some bidders timeout
    let bidTimeoutArgsV1 = [
      {
        'bidId': '284f8e1469246b',
        'bidder': 'luponmedia',
        'adUnitCode': 'div-gpt-ad-1533155193780-3',
        'auctionId': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b'
      }
    ];

    // now simulate some WIN and RENDERING
    let wonRequest = {
      'bidderCode': 'luponmedia',
      'width': 300,
      'height': 250,
      'statusMessage': 'Bid available',
      'adId': '3b40e0da8968f5',
      'requestId': '284f8e1469246a',
      'mediaType': 'banner',
      'source': 'client',
      'cpm': 0.43,
      'creativeId': '443801010',
      'currency': 'USD',
      'netRevenue': false,
      'ttl': 300,
      'referrer': '',
      'ad': "<a href='https://novi.ba' target='_blank' style='position:absolute; width:300px; height:250px; z-index:5;'> </a><iframe src='https://lupon.media/vijestiba/300x250new/index.html' height='250' width='300' scrolling='no' frameborder='0'></iframe>",
      'originalCpm': '0.43',
      'originalCurrency': 'USD',
      'auctionId': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
      'responseTimestamp': 1589707615188,
      'requestTimestamp': 1589707613908,
      'bidder': 'luponmedia',
      'adUnitCode': 'div-gpt-ad-1533155193780-2',
      'timeToRespond': 1280,
      'pbLg': '0.00',
      'pbMg': '0.40',
      'pbHg': '0.43',
      'pbAg': '0.40',
      'pbDg': '0.43',
      'pbCg': '0.43',
      'size': '300x250',
      'adserverTargeting': {
        'hb_bidder': 'luponmedia',
        'hb_adid': '3b40e0da8968f5',
        'hb_pb': '0.43',
        'hb_size': '300x250',
        'hb_source': 'client',
        'hb_format': 'banner'
      },
      'status': 'rendered',
      'params': [
        {
          'siteId': 303522,
          'keyId': '4o2c4'
        }
      ]
    };

    let wonExpect = {
      'publisher_id': 123,
      'auction_id': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
      'screen_resolution': window.screen.width + 'x' + window.screen.height,
      'device_type': 'desktop',
      'geo': null,
      'events': [
        {
          'ad_id': '3b40e0da8968f5',
          'auction_id': 'c4f0cce0-264c-483a-b2f4-8ac2248a896b',
          'adserver_targeting': {
            'hb_bidder': 'luponmedia',
            'hb_adid': '3b40e0da8968f5',
            'hb_pb': '0.43',
            'hb_size': '300x250',
            'hb_source': 'client',
            'hb_format': 'banner'
          },
          'type': 'RESPONSE',
          'bidder_code': 'luponmedia',
          'response_timestamp': 1589707615188,
          'request_timestamp': 1589707613908,
          'gpt_code': 'div-gpt-ad-1533155193780-2',
          'currency': 'USD',
          'creative_id': '443801010',
          'request_id': '284f8e1469246a',
          'time_to_respond': 1280,
          'cpm': 0.43,
          'net_revenue': false,
          'pbLg': '0.00',
          'pbMg': '0.40',
          'pbHg': '0.43',
          'pbAg': '0.40',
          'pbDg': '0.43',
          'pbCg': '0.43',
          'size': '300x250',
          'status': 'rendered',
          'status_message': 'Bid available',
          'ttl': 300,
          'is_winning': true,
          'is_upgrade': true
        }
      ]
    };

    adapterManager.registerAnalyticsAdapter({
      code: 'pubmonetize',
      adapter: pubmonetizeAnalyticsAdapter
    });

    beforeEach(function () {
      adapterManager.enableAnalytics({
        provider: 'pubmonetize',
        options: initOptions
      });
    });

    afterEach(function () {
      pubmonetizeAnalyticsAdapter.disableAnalytics();
    });

    it('builds and sends auction data', function () {
      // Step 1: Send auction init event
      events.emit(constants.EVENTS.AUCTION_INIT, auctionInit);

      // Step 2: Send bid requested event
      events.emit(constants.EVENTS.BID_REQUESTED, bidRequest);

      // Step 3: Send bid response event
      events.emit(constants.EVENTS.BID_RESPONSE, bidResponse);

      // Step 4: Send bid time out event
      events.emit(constants.EVENTS.BID_TIMEOUT, bidTimeoutArgsV1);

      // Step 5: Send auction end event
      events.emit(constants.EVENTS.AUCTION_END, {});

      testSend();
      expect(server.requests.length).to.equal(2);

      let realAfterBid = JSON.parse(server.requests[0].requestBody);

      expect(realAfterBid).to.deep.equal(expectedAfterBid);

      expect(realAfterBid).to.deep.equal(expectedAfterTimeout);

      events.emit(constants.EVENTS.BID_WON, wonRequest);

      expect(server.requests.length).to.equal(3);

      let winEventData = JSON.parse(server.requests[2].requestBody);

      expect(winEventData).to.deep.equal(wonExpect);
    });
  });
});
