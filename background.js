'use strict';

const br = typeof(browser) === 'undefined' ? chrome : browser;

let collection = [];

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
    catch(e) { return false }
    const regexResult = newRegex.exec(data.linkUrl);

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

br.runtime.onMessage.addListener((request, sender, response) => {
    if (request.command === 'setting') {
        collection = request.settings;
        createOptions();
    } else if (request.command === 'regex') {
        response(getRegexResult(request));
    }
});
