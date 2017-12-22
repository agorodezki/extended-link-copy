'use strict';

const br = typeof(browser) === 'undefined' ? chrome : browser;

br.runtime.onMessage.addListener((message) => {
    function onCopy(e) {
        document.removeEventListener('copy', onCopy, true);

        e.stopImmediatePropagation();
        e.preventDefault();

        e.clipboardData.setData('text/plain', message.data);
    }

    document.addEventListener('copy', onCopy, true);
    document.execCommand('copy');
});
