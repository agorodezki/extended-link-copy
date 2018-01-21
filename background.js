'use strict';

const br = typeof(browser) === 'undefined' ? chrome : browser;

let collection = [];

const examples = [
    {
        title: 'Copy just the domain',
        regex: '.*:\\/\\/.*?\\/',
        compose: ''
    },
    {
        title: 'Copy url without attributes',
        regex: '(.*:\\/\\/.*?)(\\?|$)',
        compose: '${1}'
    },
    {
        title: 'Copy just the attributes',
        regex: '\\?(.*)',
        compose: '${1}'
    },
    {
        title: 'Copy revised hyperlink',
        regex: '(.*:\\/\\/.*?\\/).*',
        compose: '<a href="${0}">${1}</a>'
    },
    {
        title: 'Copy OXID',
        regex: 'javascript:top\\.oxid\\.admin\\.editThis\\(\\\'(.*)\\\'\\)',
        compose: '${1}'
    }
];

function sendToTab(data) {
    br.tabs.query({active: true, currentWindow: true}, (tabs) => {
        br.tabs.sendMessage(tabs[0].id, data);
    });
}

function sendResult(collectionId, linkUrl) {
    const data = getRegexResult({
        linkUrl: linkUrl,
        regexSet: collection[collectionId]
    });

    sendToTab(data);
}

function createOptions() {
    br.contextMenus.removeAll();

    for (const collectionId in collection) {
        br.contextMenus.create({
            id: collectionId,
            title: collection[collectionId].title,
            contexts: ['link'],
            onclick: (info) => sendResult(collectionId, info.linkUrl)
        });
    }
}

function getRegexResult(data) {
    let newRegex;
    try { newRegex = new RegExp(data.regexSet.regex) }
    catch(e) { return '' }
    const regexResult = newRegex.exec(data.linkUrl);

    if (data.regexSet.compose === '') {
        return regexResult[0];
    }

    let composeArray = data.regexSet.compose.split(/(\$\{\d+\})/);

    let result = '';
    for (const composeElement of composeArray) {
        if (/^\$\{\d+\}$/g.test(composeElement)) {
            const replaceIndex = parseInt(/\d+/.exec(composeElement)[0]);
            result += regexResult[replaceIndex] || composeElement;
        } else {
            result += composeElement;
        }
    }

    return result;
}

function getSettings(result) {
    if (result.settings) {
        collection = result.settings;
    } else {
        collection = JSON.parse(JSON.stringify(examples));
        br.storage.local.set({settings: collection});
    }

    createOptions();
}

br.runtime.onMessage.addListener((request, sender, response) => {
    if (request.command === 'regex') {
        response(getRegexResult(request));
    } else if (request.command === 'examples') {
        response({settings: examples});
    }
});

br.runtime.onStartup.addListener(() => {
    if (br === chrome) {
        chrome.storage.local.get('settings', getSettings);
    } else if (br === browser) {
        browser.storage.local.get('settings').then(getSettings);
    }
});

br.storage.onChanged.addListener((changes) => {
    collection = changes.settings.newValue;
    createOptions();
});
