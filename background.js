function loadNotes() {
    return new Promise(((resolve, reject) => {
        chrome.storage.local.get(null, (results) => {
            resolve(results.notes);
        })
    }))
}

chrome.runtime.onInstalled.addListener(function (details) {
    let saveInitialSettings = false;

    if (details.reason === 'install') {
        saveInitialSettings = true;
    } else if (details.reason === 'update') {
        const thisVersion = chrome.runtime.getManifest().version;
        if (details.previousVersion !== thisVersion) {
            saveInitialSettings = true;
        }
    }

    if (saveInitialSettings) {
        chrome.storage.local.set({
            notes: {}
        }, () => { console.log('[FL Duly Noted] Default settings saved into DB') });
    }
});

function reportNoteList(tabs, notes) {
    loadNotes().then(() => {
        const result = {
            action: "FL_DN_loadNotes",
            // https://stackoverflow.com/questions/55301808/send-a-map-to-content-script
            notes: notes,
        };
        tabs.map((t) => chrome.tabs.sendMessage(t.id, result))
    });
}

function getFallenLondonTabs() {
    return new Promise((resolve, reject) => {
        chrome.windows.getCurrent(w => {
            chrome.tabs.query(
                {windowId: w.id, url: "*://*.fallenlondon.com/*"},
                function (tabs) {
                    resolve(tabs);
                }
            );
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "FL_DN_persistChanges") {
        console.debug(request.notes);

        chrome.storage.local.set({
            notes: request.notes,
        }, () => { console.log('[FL Duly Noted] New notes saved into DB') });

        getFallenLondonTabs().then(tabs => reportNoteList(tabs, request.notes));
    }

    if (request.action === "FL_DN_requestNotes") {
        loadNotes().then((notes) => {
            getFallenLondonTabs().then(tabs => reportNoteList(tabs, notes))
        });
    }
});