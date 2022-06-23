import {ajax} from '../src/ajax.js';
import {deepClone, logError, logInfo} from '../src/utils.js';
import adapter from '../src/AnalyticsAdapter.js';
import adapterManager from '../src/adapterManager.js';
import CONSTANTS from '../src/constants.json';
import {includes} from '../src/polyfill.js';

const defaultUrl = 'http://52.53.156.70:8080/v1';
const analyticsType = 'endpoint';

let reqCountry = window.reqCountry || null;

// Events needed
const {
  EVENTS: {
    AUCTION_INIT,
    BID_REQUESTED,
    BID_TIMEOUT,
    BID_RESPONSE,
    BID_WON,
    AUCTION_END,
  },
} = CONSTANTS;

let timeoutBased = false;
let requestSent = false;
let requestDelivered = false;
let elementIds = [];

// Memory objects
let completeObject = {
  publisher_id: null,
  auction_id: null,
  screen_resolution: window.screen.width + 'x' + window.screen.height,
  device_type: null,
  geo: reqCountry,
  events: [],
};

// Upgraded object
let upgradedObject = null;

let pubmonetizeAnalyticsAdapter = Object.assign(
  adapter({ defaultUrl, analyticsType }),
  {
    track({ eventType, args }) {
      switch (eventType) {
        case AUCTION_INIT:
          auctionInit(args);
          break;
        case BID_REQUESTED:
          bidRequested(args);
          break;
        case BID_RESPONSE:
          bidResponse(args);
          break;
        case BID_WON:
          bidWon(args);
          break;
        case BID_TIMEOUT:
          bidTimeout(args);
          break;
        case AUCTION_END:
          auctionEnd(args);
          break;
        default:
          break;
      }
    },
  }
);

// DFP support
let googletag = window.googletag || {};
googletag.cmd = googletag.cmd || [];
googletag.cmd.push(function () {
  googletag.pubads().addEventListener('slotRenderEnded', (args) => {
    clearSlot(args.slot.getSlotElementId());
  });
});

// Event handlers
let bidResponsesMapper = {};
let bidRequestsMapper = {};
let bidMapper = {};

function auctionInit(args) {
  // Clear events
  completeObject.events = [];
  // Allow new requests
  requestSent = false;
  requestDelivered = false;
  // Reset mappers
  bidResponsesMapper = {};
  bidRequestsMapper = {};
  bidMapper = {};

  completeObject.auction_id = args.auctionId;
  completeObject.publisher_id = pubmonetizeAnalyticsAdapter.initOptions.pubId;

  if (args.adUnitCodes && args.adUnitCodes.length > 0) {
    elementIds = args.adUnitCodes;
  }
  completeObject.device_type = deviceType();
}

function bidRequested(args) {
  let tmpObject = {
    type: 'REQUEST',
    bidder_code: args.bidderCode,
    auction_id: args.auctionId,
    bidder_request_id: args.bidderRequestId,
    event_timestamp: args.start,
    bid_gpt_codes: {},
  };

  args.bids.forEach((bid) => {
    tmpObject.bid_gpt_codes[bid.adUnitCode] = bid.sizes;
    bidMapper[bid.bidId] = bid.bidderRequestId;
  });

  bidRequestsMapper[args.bidderRequestId] = completeObject.events.push(tmpObject) - 1;
}

function bidResponse(args) {
  let tmpObject = {
    type: 'RESPONSE',
    bidder_code: args.bidderCode,
    auction_id: args.auctionId,
    creative_id: args.creativeId,
    request_timestamp: args.requestTimestamp,
    response_timestamp: args.responseTimestamp,
    time_to_respond: args.timeToRespond,
    gpt_code: args.adUnitCode,
    currency: args.currency,
    ttl: args.ttl,
    pbLg: args.pbLg,
    pbMg: args.pbMg,
    pbHg: args.pbHg,
    pbAg: args.pbAg,
    pbDg: args.pbDg,
    pbCg: args.pbCg,
    size: args.size,
    cpm: args.cpm,
    net_revenue: args.netRevenue,
    ad_id: args.adId,
    request_id: args.requestId,
    adserver_targeting: args.adserverTargeting,
    params: args.params,
    status_message: args.statusMessage,
    is_winning: false,
  };

  bidResponsesMapper[args.requestId] = completeObject.events.push(tmpObject) - 1;
}

function bidWon(args) {
  let eventIndex = bidResponsesMapper[args.requestId];
  if (eventIndex !== undefined) {
    if (requestDelivered) {
      if (completeObject.events[eventIndex]) {
        // do the upgrade
        logInfo('Pubmonetize Analytics - Upgrading request');
        completeObject.events[eventIndex].is_winning = true;
        completeObject.events[eventIndex].is_upgrade = true;
        completeObject.events[eventIndex].status = args.status;
        upgradedObject = deepClone(completeObject);
        upgradedObject.events = [completeObject.events[eventIndex]];
        sendEvent(upgradedObject, {
          event: 'bid-won',
        }); // send upgrade
      } else {
        logInfo('Pubmonetize Analytics - CANNOT FIND INDEX FOR REQUEST ' + args.requestId);
      }
    } else {
      completeObject.events[eventIndex].is_winning = true;
    }
  } else {
    logInfo('Pubmonetize Analytics - Response not found, creating new one.');
    let tmpObject = {
      type: 'RESPONSE',
      bidder_code: args.bidderCode,
      auction_id: args.auctionId,
      creative_id: args.creativeId,
      request_timestamp: args.requestTimestamp,
      response_timestamp: args.responseTimestamp,
      time_to_respond: args.timeToRespond,
      gpt_code: args.adUnitCode,
      currency: args.currency,
      ttl: args.ttl,
      pbLg: args.pbLg,
      pbMg: args.pbMg,
      pbHg: args.pbHg,
      pbAg: args.pbAg,
      pbDg: args.pbDg,
      pbCg: args.pbCg,
      size: args.size,
      cpm: args.cpm,
      net_revenue: args.netRevenue,
      ad_id: args.adId,
      request_id: args.requestId,
      adserver_targeting: args.adserverTargeting,
      params: args.params,
      status_message: args.statusMessage,
      status: args.status,
      is_winning: true,
      is_lost: true,
    };
    let lostObject = deepClone(completeObject);
    lostObject.events = [tmpObject];
    sendEvent(lostObject, {
      event: 'bid-won',
    }); // send lost object
  }
}

function bidTimeout(args) {
  let timeoutObject = deepClone(completeObject);
  timeoutObject.events = [];
  let usedRequestIds = [];

  args.forEach((bid) => {
    let pulledRequestId = bidMapper[bid.bidId];
    let eventIndex = bidRequestsMapper[pulledRequestId];
    if (
      eventIndex !== undefined &&
      completeObject.events[eventIndex] &&
      usedRequestIds.indexOf(pulledRequestId) === -1
    ) {
      // mark as timeout
      let tempEventIndex =
        timeoutObject.events.push(completeObject.events[eventIndex]) - 1;
      timeoutObject.events[tempEventIndex].type = 'TIMEOUT';
      usedRequestIds.push(pulledRequestId); // mark as used
    }
  });

  if (timeoutObject.events.length > 0) {
    sendEvent(timeoutObject, {
      event: 'bid-timeout',
    }); // send timeout
    logInfo('Pubmonetize Analytics - Sending timeout requests');
  }
}

function auctionEnd(args) {
  logInfo('Pubmonetize Analytics - Auction Ended at ' + Date.now());
  if (timeoutBased) {
    setTimeout(function () {
      requestSent = true;
      sendEvent(completeObject, {
        event: 'auction-ended',
      });
    }, 3500);
  } else {
    sendEventFallback();
  }
}

// Methods
function deviceType() {
  if (
    /ipad|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(
      navigator.userAgent.toLowerCase()
    )
  ) {
    return 'tablet';
  }
  if (
    /iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
      navigator.userAgent.toLowerCase()
    )
  ) {
    return 'mobile';
  }
  return 'desktop';
}

function clearSlot(elementId) {
  if (includes(elementIds, elementId)) {
    elementIds.splice(elementIds.indexOf(elementId), 1);
    logInfo('Pubmonetize Analytics - Done with: ' + elementId);
  }
  if (elementIds.length === 0 && !requestSent && !timeoutBased) {
    requestSent = true;
    sendEvent(completeObject);
    logInfo('Pubmonetize Analytics - Everything ready');
  }
}

export function testSend() {
  sendEvent(completeObject);
  logInfo('Pubmonetize Analytics - Sending without any conditions, used for testing');
}

function sendEventFallback() {
  setTimeout(function () {
    if (!requestSent) {
      requestSent = true;
      sendEvent(completeObject, {
        event: 'auction-ended',
      });
      logInfo('Pubmonetize Analytics - Sending event using fallback method.');
    }
  }, 2000);
}

function sendEvent(completeObject) {
  requestDelivered = true;
  try {
    let dataToSend = JSON.stringify(completeObject);

    let ajaxEndpoint = defaultUrl;

    // if (args.event) {
    //   ajaxEndpoint = defaultUrl + '/' + args.event;
    // }

    ajax(
      ajaxEndpoint,
      function () {
        logInfo('Pubmonetize Analytics - Sending complete events at ' + Date.now());
      },
      dataToSend,
      {
        contentType: 'application/json',
        method: 'POST',
      }
    );
  } catch (err) {
    logError('Pubmonetize Analytics - Sending event error: ' + err);
  }
}

// save the base class function
pubmonetizeAnalyticsAdapter.originEnableAnalytics = pubmonetizeAnalyticsAdapter.enableAnalytics;

// override enableAnalytics so we can get access to the config passed in from the page
pubmonetizeAnalyticsAdapter.enableAnalytics = function (config) {
  pubmonetizeAnalyticsAdapter.initOptions = config.options;

  if (!config.options.pubId) {
    logError("Pubmonetize Analytics - Publisher ID (pubId) option is not defined. Analytics won't work");
    return;
  }
  pubmonetizeAnalyticsAdapter.originEnableAnalytics(config); // call the base class function
};

adapterManager.registerAnalyticsAdapter({
  adapter: pubmonetizeAnalyticsAdapter,
  code: 'pubmonetize',
});

export default pubmonetizeAnalyticsAdapter;
