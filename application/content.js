

(function () {
    function detectThreats() {
        const suspiciousPatterns = ["eval(", "document.write(", "onbeforeunload", "onunload", "setTimeout(", "setInterval("];
        const scripts = document.getElementsByTagName('script');
        let threatsDetected = [];

        for (let script of scripts) {
            if (script.src) {

                continue;
            } else {
                const content = script.innerHTML;
                for (let pattern of suspiciousPatterns) {
                    if (content.includes(pattern)) {
                        threatsDetected.push({
                            script: "Inline script",
                            pattern: pattern
                        });
                    }
                }
            }
        }

        if (threatsDetected.length > 0) {
            console.log('Ameaças detectadas:', threatsDetected);

            browser.runtime.sendMessage({
                action: "reportThreats",
                threats: threatsDetected
            });
        }
    }


    if (document.readyState === "complete" || document.readyState === "interactive") {
        detectThreats();
    } else {
        document.addEventListener('DOMContentLoaded', detectThreats);
    }
})();

(function () {

    function detectStorageUsage() {
        const localStorageKeys = Object.keys(localStorage);
        const sessionStorageKeys = Object.keys(sessionStorage);

        if (localStorageKeys.length > 0 || sessionStorageKeys.length > 0) {
            console.log('Uso de armazenamento detectado:', { localStorageKeys, sessionStorageKeys });
            browser.runtime.sendMessage({
                action: "reportStorageUsage",
                localStorageKeys: localStorageKeys,
                sessionStorageKeys: sessionStorageKeys
            });
        }
    }


    if (document.readyState === "complete" || document.readyState === "interactive") {
        detectStorageUsage();
    } else {
        document.addEventListener('DOMContentLoaded', detectStorageUsage);
    }
})();


(function () {
    let canvasFingerprintingDetected = false;

    function reportCanvasFingerprinting() {
        if (!canvasFingerprintingDetected) {
            canvasFingerprintingDetected = true;
            console.log('Canvas fingerprinting detectado!');
            browser.runtime.sendMessage({ action: "canvasFingerprintingDetected" });
        }
    }


    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function () {
        console.log('toDataURL interceptado');
        reportCanvasFingerprinting();
        return originalToDataURL.apply(this, arguments);
    };


    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function () {
        console.log('getImageData interceptado');
        reportCanvasFingerprinting();
        return originalGetImageData.apply(this, arguments);
    };
})();
