# Overview

Module Name: Pubmonetize Analytics Adapter
Module Type: Analytics Adapter
Maintainer: nikhil@pubmonetize.com

---

# Description

Analytics adapter for Pubmonetize. Contact contact@pubmonetize.com for more information or to sign up for analytics.

---

# Implementation Code

Integration is as easy as adding the following lines of code:

```javascript
pbjs.que.push(function () {
    pbjs.enableAnalytics({
        provider: 'pubmonetize',
        options: {
            pubID: '' // Contact Pubmonetize to receive your unique publisher id
        }
    });
});
```
