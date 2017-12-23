'use strict';

const br = typeof(browser) === 'undefined' ? chrome : browser;

let settings = [
    // {
    //     title: 'Copy OXID',
    //     regex: 'javascript:top\\.oxid\\.admin\\.editThis\\(\'(.*)\'\\)'
    // }
];

function saveOptions() {
    br.storage.local.set({ settings });
    sendToBackground();
}

function removeOption(index) {
    settings.splice(index, 1);
    saveOptions();
}

function restoreOptions() {
    br.storage.local.get('settings').then(
        (result) => {
            settings = result.settings || [];
            renderOptions();
            sendToBackground();
        },
        (error) => {
            console.log(error);
        }
    );
}

function sendToBackground() {
    browser.runtime.sendMessage({ settings });
}

function renderOptions() {
    document.getElementById('list-table').innerHTML =
        '<tr align="left">' +
            '<th>Title</th>' +
            '<th>RegEx</th>' +
            '<th></th>' +
        '</tr>';

    for (const [index, item] of Object.entries(settings)) {
        addListNode(index, item);
    }

    addListNode(settings.length);
}

function addListNode(index, data) {
    const tableRow = document.createElement('tr');

    tableRow.innerHTML =
        '<td><input name="title" type="text"></td>' +
        '<td><input name="regex" type="text"></td>' +
        '<td><button name="remove" type="submit">X</button></td>';

    const inputTitle = tableRow.querySelector('[name=title]');
    const inputRegex = tableRow.querySelector('[name=regex]');
    const removeButton = tableRow.querySelector('[name=remove]');

    inputTitle.setAttribute('name', 'title-' + index);
    inputRegex.setAttribute('name', 'regex-' + index);
    removeButton.setAttribute('name', index);

    if (data) {
        inputTitle.setAttribute('value', data.title || '');
        inputRegex.setAttribute('value', data.regex || '');
    } else {
        removeButton.remove();
    }

    document.getElementById('list-table').appendChild(tableRow);
}

function handleListSubmit(e) {
    e.preventDefault();

    if (e.explicitOriginalTarget.name === 'save') {
        saveOptions(true);
    } else if (e.explicitOriginalTarget.name !== '') {
        removeOption(e.explicitOriginalTarget.name);
    }

    renderOptions();
}

function handleListInput(e) {
    const [element, index] = e.explicitOriginalTarget.name.split('-');
    if (parseInt(index) === settings.length) {
        settings.push({[element]: e.explicitOriginalTarget.value});
        addListNode(settings.length);
    } else {
        settings[index][element] = e.explicitOriginalTarget.value;
    }
}

function getTestResult() {
    const regex = new RegExp(document.getElementById('test-regex').value);
    const result = regex.exec(document.getElementById('test-link').value) || '';
    document.getElementById('test-result').innerText = result.length ? result[1] : result;
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('list').addEventListener('submit', handleListSubmit);
document.getElementById('list-table').addEventListener('input', handleListInput);
document.getElementById('test').addEventListener('input', getTestResult);
