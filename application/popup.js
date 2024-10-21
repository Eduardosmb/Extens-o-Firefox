

document.addEventListener('DOMContentLoaded', function () {

  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    const tabId = tabs[0].id;


    function calculatePrivacyScore(data) {
      let score = 100;
      score -= data.thirdPartyDomains.length * 2.5;
      score -= data.threats.length * 1;
      score -= data.cookies.totalCookies * 0.5;
      score -= data.cookies.thirdPartyCookies * 1;
      
      if (data.canvasFingerprintingDetected) {
        score -= 20;
      }
      if (score < 0) score = 0;
      return Math.round(score);
    }


    function getScoreClass(score) {
      if (score >= 80) return 'score-good';
      if (score >= 50) return 'score-warning';
      return 'score-bad';
    }


    function updateProgressCircle(score) {
      const scoreValue = document.getElementById('score-value');
      const scoreLabel = document.getElementById('score-label');
      const progressCircle = document.querySelector('.progress-circle');

      scoreValue.textContent = `${score}`;


      scoreValue.className = '';
      scoreLabel.className = '';

      const scoreClass = getScoreClass(score);
      scoreValue.classList.add(scoreClass);


      if (score >= 80) {
        scoreLabel.textContent = 'Boa Privacidade';
        scoreLabel.classList.add('score-good');
      } else if (score >= 50) {
        scoreLabel.textContent = 'Privacidade Média';
        scoreLabel.classList.add('score-warning');
      } else {
        scoreLabel.textContent = 'Baixa Privacidade';
        scoreLabel.classList.add('score-bad');
      }


      let conicGradient;
      if (score >= 80) {
        conicGradient = `conic-gradient(#4caf50 ${score}%, #ddd ${score}%)`;
      } else if (score >= 50) {
        conicGradient = `conic-gradient(#ff9800 ${score}%, #ddd ${score}%)`;
      } else {
        conicGradient = `conic-gradient(#f44336 ${score}%, #ddd ${score}%)`;
      }
      progressCircle.style.background = conicGradient;
    }


    function setupAccordions() {
      const headers = document.querySelectorAll('.section-header');
      headers.forEach(header => {
        header.addEventListener('click', () => {
          const section = header.parentElement;
          const content = section.querySelector('.section-content');


          section.classList.toggle('active');
        });
      });
    }


    Promise.all([
      browser.runtime.sendMessage({ action: "getThirdPartyDomains", tabId: tabId }),
      browser.runtime.sendMessage({ action: "getThreats", tabId: tabId }),
      browser.runtime.sendMessage({ action: "getCookiesData", tabId: tabId }),
      browser.runtime.sendMessage({ action: "getCanvasFingerprinting", tabId: tabId }),
      browser.runtime.sendMessage({ action: "getStorageUsage", tabId: tabId })
    ]).then(responses => {
      const [thirdPartyDomainsResponse, threatsResponse, cookiesResponse, canvasResponse, storageResponse] = responses;

      const data = {
        thirdPartyDomains: thirdPartyDomainsResponse.domains || [],
        threats: threatsResponse.threats || [],
        cookies: cookiesResponse.cookiesData || {
          totalCookies: 0,
          firstPartyCookies: 0,
          thirdPartyCookies: 0,
          sessionCookies: 0,
          persistentCookies: 0
        },
        canvasFingerprintingDetected: canvasResponse.detected || false,
        storageUsage: storageResponse.storageData || null
      };


      const score = calculatePrivacyScore(data);


      updateProgressCircle(score);


      const contentDiv = document.getElementById('content');
      if (data.thirdPartyDomains.length > 0) {
        contentDiv.innerHTML = '<ul>' +
          data.thirdPartyDomains.map(domain => `<li>${domain}</li>`).join('') +
          '</ul>';
      } else {
        contentDiv.innerHTML = '<p>Nenhum domínio de terceira parte detectado.</p>';
      }


      const threatsDiv = document.getElementById('threats');
      if (data.threats.length > 0) {
        threatsDiv.innerHTML = '<ul>' +
          data.threats.map(threat => `<li>Padrão: ${threat.pattern} encontrado em ${threat.script}</li>`).join('') +
          '</ul>';
      } else {
        threatsDiv.innerHTML = '<p>Nenhuma ameaça detectada.</p>';
      }


      const storageDiv = document.getElementById('storage');
      if (data.storageUsage) {
        storageDiv.innerHTML = `
          <p>Chaves no Local Storage: <strong>${data.storageUsage.localStorageKeys.length}</strong></p>
          <p>Chaves no Session Storage: <strong>${data.storageUsage.sessionStorageKeys.length}</strong></p>
          <p>Total de Chaves: <strong>${data.storageUsage.localStorageKeys.length + data.storageUsage.sessionStorageKeys.length}</strong></p>
        `;
      } else {
        storageDiv.innerHTML = '<p>Nenhum uso de armazenamento detectado.</p>';
      }


      const canvasDiv = document.getElementById('canvas');
      if (data.canvasFingerprintingDetected) {
        canvasDiv.innerHTML = '<p class="detected">Detectado!</p>';
      } else {
        canvasDiv.innerHTML = '<p class="not-detected">Não detectado.</p>';
      }


      const cookiesDiv = document.getElementById('cookies');
      if (data.cookies.totalCookies > 0) {
        cookiesDiv.innerHTML = `
          <p>Total de Cookies: <strong>${data.cookies.totalCookies}</strong></p>
          <p>Cookies de Primeira Parte: <strong>${data.cookies.firstPartyCookies}</strong></p>
          <p>Cookies de Terceira Parte: <strong>${data.cookies.thirdPartyCookies}</strong></p>
          <p>Cookies de Sessão: <strong>${data.cookies.sessionCookies}</strong></p>
          <p>Cookies Persistentes: <strong>${data.cookies.persistentCookies}</strong></p>
        `;
      } else {
        cookiesDiv.innerHTML = '<p>Nenhum cookie detectado.</p>';
      }


      setupAccordions();

    }).catch(error => {
      console.error(`Erro ao coletar dados para a pontuação: ${error}`);
      const scoreValue = document.getElementById('score-value');
      const scoreLabel = document.getElementById('score-label');
      scoreValue.textContent = 'Erro';
      scoreValue.classList.remove('score-good', 'score-warning', 'score-bad');
      scoreLabel.textContent = 'Erro';
      scoreLabel.classList.remove('score-good', 'score-warning', 'score-bad');
      scoreValue.style.color = 'black';


      document.querySelectorAll('.section-content').forEach(content => {
        content.innerHTML = '<p>Erro ao carregar dados.</p>';
      });
    });
  }).catch(error => {
    console.error(`Erro ao obter a aba ativa: ${error}`);
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<p>Erro ao obter a aba ativa.</p>';
  });
});
