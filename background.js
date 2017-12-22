'use strict';

const br = typeof(browser) === 'undefined' ? chrome : browser;

let collection = [
    // {
    //     title: 'Copy OXID',
    //     regex: 'javascript:top\\.oxid\\.admin\\.editThis\\(\'(.*)\'\\)'
    // }
];

function sendToTab(data) {
    br.tabs.query({active: true, currentWindow: true}, (tabs) => {
        br.tabs.sendMessage(tabs[0].id, {data: data});
    });
}

function sendResult(collectionId, linkUrl) {
    const regex = new RegExp(collection[collectionId].regex);
    let result = regex.exec(linkUrl);
    result = result.length ? result[1] : result;
    sendToTab(result);
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

br.runtime.onMessage.addListener((request) => {
    collection = request.settings;
    createOptions();
});
