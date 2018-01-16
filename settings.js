'use strict';

const br = typeof(browser) === 'undefined' ? chrome : browser;

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

let settings = [];

function restoreOptions() {
    if (br === chrome) {
        chrome.storage.local.get('settings', getSettings);
    } else if (br === browser) {
        browser.storage.local.get('settings').then(getSettings);
    }
}

function getSettings(result) {
    settings = result.settings || JSON.parse(JSON.stringify(examples));
    renderOptions();
}

function renderOptions() {
    document.getElementById('list-table').innerHTML =
        '<tr align="left">' +
            '<th>Title</th>' +
            '<th>RegEx</th>' +
            '<th>Compose</th>' +
            '<th></th>' +
        '</tr>';

    for (const [index, item] of Object.entries(settings)) {
        addListNode(index, item);
    }

    addListNode(settings.length);
}

function addListNode(index, data) {
    let tableRow = document.createElement('tr');

    tableRow.innerHTML =
        '<td><input name="title" type="text"></td>' +
        '<td><input name="regex" type="text"></td>' +
        '<td><input name="compose" type="text"></td>' +
        '<td><button name="remove" type="button">X</button></td>';

    const inputTitle = tableRow.querySelector('[name=title]');
    const inputRegex = tableRow.querySelector('[name=regex]');
    const inputCompose = tableRow.querySelector('[name=compose]');
    const removeButton = tableRow.querySelector('[name=remove]');

    inputTitle.setAttribute('name', 'title-' + index);
    inputRegex.setAttribute('name', 'regex-' + index);
    inputCompose.setAttribute('name', 'compose-' + index);
    removeButton.setAttribute('name', 'remove-' + index);

    if (data) {
        inputTitle.setAttribute('value', data.title || '');
        inputRegex.setAttribute('value', data.regex || '');
        inputCompose.setAttribute('value', data.compose || '');
    } else {
        removeButton.remove();
    }

    document.getElementById('list-table').appendChild(tableRow);
    tableRow = null;
}

function handleListClick(e) {
    e.preventDefault();

    const elementName = e.target.name.split('-');

    if (elementName[0] === 'save') {
        br.storage.local.set({ settings });
    } else if (elementName[0] === 'reset') {
        settings = JSON.parse(JSON.stringify(examples));
    } else if (elementName[0] === 'remove') {
        settings.splice(parseInt(elementName[1]), 1);
    } else {
        return false;
    }

    renderOptions();
}

function handleListInput(e) {
    const [element, index] = e.target.name.split('-');
    if (parseInt(index) === settings.length) {
        settings.push({[element]: e.target.value});
        addListNode(settings.length);
    } else {
        settings[index][element] = e.target.value;
    }
}

function getTestResult() {
    const data = {
        command: 'regex',
        linkUrl: document.getElementById('test-link').value,
        regexSet: {
            regex: document.getElementById('test-regex').value,
            compose: document.getElementById('test-compose').value
        }
    };

    if (br === chrome) {
        chrome.runtime.sendMessage(data, renderTestResult);
    } else if (br === browser) {
        browser.runtime.sendMessage(data).then(renderTestResult);
    }
}

function renderTestResult(response) {
    document.getElementById('test-result').innerText = response;
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('list').addEventListener('click', handleListClick);
document.getElementById('list-table').addEventListener('input', handleListInput);
document.getElementById('test').addEventListener('input', getTestResult);
