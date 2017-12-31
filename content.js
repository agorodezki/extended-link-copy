'use strict';

const br = typeof(browser) === 'undefined' ? chrome : browser;

br.runtime.onMessage.addListener((request) => {
    function onCopy(e) {
        document.removeEventListener('copy', onCopy, true);

        e.stopImmediatePropagation();
        e.preventDefault();

        e.clipboardData.setData('text/plain', request);
    }

    document.addEventListener('copy', onCopy, true);
    document.execCommand('copy');
});
