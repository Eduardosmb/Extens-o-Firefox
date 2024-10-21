let thirdPartyDomains = {};
let threatsPerTab = {};
let storageUsagePerTab = {};
let canvasFingerprintingPerTab = {};


browser.webRequest.onCompleted.addListener(
  function (details) {
    if (details.tabId >= 0) {
      const requestUrl = new URL(details.url);
      browser.tabs.get(details.tabId).then(tab => {
        const pageUrl = new URL(tab.url);
        if (requestUrl.hostname !== pageUrl.hostname) {
          if (!thirdPartyDomains[details.tabId]) {
            thirdPartyDomains[details.tabId] = new Set();
          }
          thirdPartyDomains[details.tabId].add(requestUrl.hostname);
          console.log(`Domínio de terceira parte detectado: ${requestUrl.hostname}`);
        }
      }).catch(error => {
        console.error(`Erro ao obter a aba: ${error}`);
      });
    }
  },
  { urls: ["<all_urls>"] }
);


function getCookiesData(tabId, callback) {
  browser.tabs.get(tabId).then(tab => {
    const url = tab.url;
    browser.cookies.getAll({ url: url }).then(cookies => {
      let firstPartyCookies = 0;
      let thirdPartyCookies = 0;
      let sessionCookies = 0;
      let persistentCookies = 0;

      const pageHostname = new URL(url).hostname;

      cookies.forEach(cookie => {



        const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
        if (cookieDomain === pageHostname || cookieDomain.endsWith(`.${pageHostname}`)) {
          firstPartyCookies++;
        } else {
          thirdPartyCookies++;
        }


        if (cookie.session) {
          sessionCookies++;
        } else {
          persistentCookies++;
        }
      });

      callback({
        firstPartyCookies,
        thirdPartyCookies,
        sessionCookies,
        persistentCookies,
        totalCookies: cookies.length
      });
    }).catch(error => {
      console.error(`Erro ao obter cookies para a aba ${tabId}: ${error}`);
      callback(null);
    });
  }).catch(error => {
    console.error(`Erro ao obter a aba ${tabId}: ${error}`);
    callback(null);
  });
}


browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`Mensagem recebida: ${JSON.stringify(message)}`);

  if (message.action === "reportThreats") {
    const tabId = sender.tab.id;
    if (!threatsPerTab[tabId]) {
      threatsPerTab[tabId] = [];
    }
    threatsPerTab[tabId] = threatsPerTab[tabId].concat(message.threats);
    console.log(`Ameaças detectadas na aba ${tabId}:`, threatsPerTab[tabId]);
  }

  if (message.action === "getThirdPartyDomains") {
    const tabId = message.tabId;
    const domains = thirdPartyDomains[tabId] ? Array.from(thirdPartyDomains[tabId]) : [];
    sendResponse({ domains: domains });
  }

  if (message.action === "getThreats") {
    const tabId = message.tabId;
    const threats = threatsPerTab[tabId] || [];
    sendResponse({ threats: threats });
  }

  if (message.action === "reportStorageUsage") {
    const tabId = sender.tab.id;
    storageUsagePerTab[tabId] = {
      localStorageKeys: message.localStorageKeys,
      sessionStorageKeys: message.sessionStorageKeys
    };
    console.log(`Uso de armazenamento detectado na aba ${tabId}:`, storageUsagePerTab[tabId]);
  }

  if (message.action === "getStorageUsage") {
    const tabId = message.tabId;
    const storageData = storageUsagePerTab[tabId];
    sendResponse({ storageData: storageData });
  }

  if (message.action === "canvasFingerprintingDetected") {
    const tabId = sender.tab.id;
    canvasFingerprintingPerTab[tabId] = true;
    console.log(`Canvas fingerprinting detectado na aba ${tabId}`);
  }

  if (message.action === "getCanvasFingerprinting") {
    const tabId = message.tabId;
    const detected = canvasFingerprintingPerTab[tabId] || false;
    sendResponse({ detected: detected });
  }


  if (message.action === "getCookiesData") {
    const tabId = message.tabId;
    getCookiesData(tabId, (data) => {
      sendResponse({ cookiesData: data });
    });
    return true;
  }


  return true;
});


browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {

    delete thirdPartyDomains[tabId];
    delete threatsPerTab[tabId];
    delete storageUsagePerTab[tabId];
    delete canvasFingerprintingPerTab[tabId];
    console.log(`Dados limpos para a aba ${tabId} devido à atualização.`);
  }
});


browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  delete thirdPartyDomains[tabId];
  delete threatsPerTab[tabId];
  delete storageUsagePerTab[tabId];
  delete canvasFingerprintingPerTab[tabId];
  console.log(`Dados limpos para a aba ${tabId} devido ao fechamento.`);
});
