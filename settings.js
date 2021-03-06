'use strict';

const br = typeof(browser) === 'undefined' ? chrome : browser;

let settings = [];

function runOnCurrentBrowser(apiFunction, data, promiseBack) {
    if (br === chrome) {
        apiFunction(data, promiseBack);
    } else if (br === browser) {
        apiFunction(data).then(promiseBack);
    }
}

function getSettings(result) {
    settings = result.settings;
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

    if (!e.target.name) {
        return false
    }

    const elementName = e.target.name.split('-');

    if (elementName[0] === 'save') {
        br.storage.sync.set({ settings });
    } else if (elementName[0] === 'reset') {
        runOnCurrentBrowser(br.runtime.sendMessage, {command: 'examples'}, getSettings);
        return true;
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

    runOnCurrentBrowser(br.runtime.sendMessage, data, (response) => {
        document.getElementById('test-result').innerText = response;
    });
}

document.addEventListener('DOMContentLoaded', runOnCurrentBrowser(br.storage.sync.get, 'settings', getSettings));
document.getElementById('list').addEventListener('click', handleListClick);
document.getElementById('list-table').addEventListener('input', handleListInput);
document.getElementById('test').addEventListener('input', getTestResult);
