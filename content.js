
const GLOBE_BTN_CLASS_LIST = "fa fa-inverse fa-stack-1x fa-pencil";
const EXTENSION_NAME = 'FL Masquerade';

let USER_NOTES = {
    "branch_134607": "Horrible singing."
}

function log(message) {
    console.log(`[${EXTENSION_NAME}] ${message}`);
}

function debug(message) {
    console.debug(`[${EXTENSION_NAME}] ${message}`);
}

function showModalInput(title, imageURL, label, submitButtonText, contents, description, handler) {
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("modal-dialog__overlay", "modal--share-dialog__overlay", "modal-dialog__overlay--after-open");

    const dialogDiv = document.createElement("div");
    dialogDiv.classList.add("modal-dialog", "media--root", "modal-dialog--after-open");
    dialogDiv.setAttribute("role", "dialog");
    dialogDiv.setAttribute("aria-modal", "true");
    dialogDiv.setAttribute("tabindex", "-1");

    const contentsDiv = document.createElement("div");
    contentsDiv.className = "modal__content";

    const titleHeader = document.createElement("h1");
    titleHeader.classList.add("heading", "heading--1");
    titleHeader.textContent = title;

    const labelHeader = document.createElement("p");
    labelHeader.textContent = label;

    const descriptionText = document.createElement("p");
    descriptionText.className = "descriptive";
    descriptionText.textContent = description;

    const mediaDiv = document.createElement("div");
    mediaDiv.className = "media";
    const mediaLeftDiv = document.createElement("div");
    mediaLeftDiv.className = "media__left";
    const mediaBodyDiv = document.createElement("div");
    mediaBodyDiv.className = "media__body";

    const imageCardDiv = document.createElement("div");
    imageCardDiv.classList.add("card", "card--sm");
    const image = document.createElement("img");
    image.className = "media__object";
    image.setAttribute("src", imageURL);
    image.setAttribute("height", 113);
    image.setAttribute("width", 97);

    const formElement = document.createElement("form");
    formElement.setAttribute("action", "#");

    const editField = document.createElement("p");
    editField.className = "form__group";

    const textInput = document.createElement("input");
    textInput.setAttribute("name", "textInput");
    textInput.setAttribute("id", "textInput");
    textInput.setAttribute("value", contents);
    textInput.className = "form__control";

    const buttonsDiv = document.createElement("div");
    buttonsDiv.style.cssText = "text-align: right";
    const cancelButton = document.createElement("button");
    cancelButton.classList.add("button", "button--primary");
    cancelButton.textContent = "Cancel";
    const submitButton = document.createElement("button");
    submitButton.classList.add("button", "button--primary");
    submitButton.textContent = submitButtonText;

    imageCardDiv.appendChild(image);

    mediaLeftDiv.append(imageCardDiv);
    mediaDiv.appendChild(mediaLeftDiv);
    mediaDiv.appendChild(mediaBodyDiv);

    editField.appendChild(textInput);
    formElement.appendChild(editField);
    formElement.appendChild(descriptionText);

    buttonsDiv.appendChild(cancelButton);
    buttonsDiv.appendChild(submitButton);
    formElement.appendChild(buttonsDiv);

    mediaBodyDiv.appendChild(labelHeader);
    mediaBodyDiv.appendChild(formElement);

    contentsDiv.appendChild(titleHeader);
    contentsDiv.appendChild(mediaDiv);

    dialogDiv.appendChild(contentsDiv);
    containerDiv.appendChild(dialogDiv);

    const modalPortals = document.querySelectorAll("div[class='ReactModalPortal']");
    if (modalPortals != null) {
        modalPortals[modalPortals.length - 1].appendChild(containerDiv);
    }

    submitButton.addEventListener("click", () => {
        containerDiv.remove();
        if (handler != null) {
            handler(textInput.value);
        }
    });

    cancelButton.addEventListener("click", () => {
        containerDiv.remove();
    });
}

function createButtonlet(buttonId, icon, title) {
    const buttonlet = document.createElement("button");
    buttonlet.setAttribute("id", buttonId);
    buttonlet.setAttribute("type", "button");
    buttonlet.className = "buttonlet-container";

    const outerSpan = document.createElement("span");
    outerSpan.classList.add("buttonlet", "fa-stack", "fa-lg", "buttonlet-enabled");
    outerSpan.setAttribute("title", title);

    [
        ["fa", "fa-circle", "fa-stack-2x"],
        (GLOBE_BTN_CLASS_LIST + " fa-pencil").split(" "),
        ["u-visually-hidden"]
    ].map(classNames => {
        let span = document.createElement("span");
        span.classList.add(...classNames);
        outerSpan.appendChild(span);
    })

    buttonlet.appendChild(outerSpan);

    return buttonlet;
}

function wrapButtonInContainer(button) {
    const containerDiv = document.createElement("div");
    containerDiv.className = "branch__plan-buttonlet";
    containerDiv.appendChild(button);
    return containerDiv;
}

function createLabelNode(formattedGainText) {
    const outerLabel = document.createElement("span");
    outerLabel.classList.add("descriptive");
    outerLabel.innerText = formattedGainText;
    return outerLabel;
}

function setBranchNote(node, text) {
    const existingNotes = node.querySelectorAll("span[id='user-note'], p[id='user-note']");
    if (existingNotes) {
        for (const node of existingNotes) {
            node.remove();
        }
    }

    if (text === "") {
        return;
    }

    const noteTextNode = createLabelNode(`NOTE: ${text}`);
    noteTextNode.setAttribute("id", "user-note");
    const noteContainer = document.createElement("p");
    noteContainer.appendChild(noteTextNode);

    const description = node.querySelector("div[class='media__body branch__body'] > div > p, div[class='storylet__description-container'] > p");
    const annotation = description.querySelector("span[class='descriptive']");

    const branchText = description.textContent;
    const textContainer = document.createElement("p");
    textContainer.setAttribute("id", "user-note");
    textContainer.textContent = branchText;

    /*
    *Four* possible cases:

    1. Text is not in the paragraph and annotation is in a single span after the text.
    2. Text is in paragraph, no annotation.
    3. Text and annotation span are both in separate paragraphs.
    4. Storylet text is not in any paragraph, just sits there as itself.

    Note to self: discuss with therapist why am I even doing this.
     */

    if (annotation) {
        if (annotation.parentElement.childElementCount === 1) {
            // Case 3: Annotation is in a separate paragraph
            description.appendChild(noteContainer)
        } else {
            // Case 1: Annotation is directly after the text.
            // Specifically, this refers to investigation branch on Constables card.
            const annotationNode = createLabelNode(annotation.textContent);
            const annotationContainer = document.createElement("p");
            annotationContainer.appendChild(annotationNode);

            description.textContent = "";

            description.appendChild(textContainer);
            description.appendChild(annotationContainer);
            description.appendChild(noteContainer);
        }
    } else {
        // Case 2: Simple branch done in modern style.
        description.parentElement.insertBefore(noteContainer, description.nextSibling);
    }
}

function persistNotes() {
    debug("Saving notes to the DB...");
    chrome.runtime.sendMessage({
        action: "FL_DN_persistChanges",
        notes: USER_NOTES,
    })
}

let mainContentObserver = new MutationObserver(function (mutations) {
    for (let m = 0; m < mutations.length; m++) {
        const mutation = mutations[m];

        for (let n = 0; n < mutation.addedNodes.length; n++) {
            const node = mutation.addedNodes[n];

            if (node.nodeName !== "DIV") {
                continue;
            }

            let branchContainers = node.querySelectorAll("div[data-branch-id]");
            if (branchContainers.length === 0 && node.nodeName === "DIV" && node.hasAttribute("data-branch-id")) {
                branchContainers = [node];
            }

            for (const branch of branchContainers) {
                const branchId = branch.attributes["data-branch-id"].value;
                const noteKey = `branch_${branchId}`;

                if (!branch.querySelector("button[id='branchNote']")) {
                    const editButton = createButtonlet("branchNote", "pencil", "Make a note on this branch");
                    const branchImage = document.querySelector("img[class*='small-card__image']");

                    editButton.addEventListener("click", (e) => {
                        showModalInput(
                            "Make a note",
                            branchImage !== undefined ? branchImage.src : "oops",
                            "A few words about this branch:",
                            "Save",
                            USER_NOTES[noteKey] || "Hello, world!",
                            "To remove your note simply leave the field empty.",
                            (note) => {
                                if (note.length > 0) {
                                    USER_NOTES[noteKey] = note;
                                } else {
                                    delete USER_NOTES[noteKey];
                                }
                                setBranchNote(branch, note);
                                persistNotes();
                            }
                        );
                    });

                    const branchHeader = branch.querySelector("h2[class*='branch__title'], h2[class*='storylet__heading']");

                    const otherButtons = branch.querySelectorAll("div[class*='storylet-root__frequency'] button");
                    if (otherButtons.length > 0) {
                        const container = otherButtons[0].parentElement;
                        container.insertBefore(editButton, otherButtons[otherButtons.length - 1].nextSibling);
                    } else {
                        const container = branchHeader.parentElement;
                        container.insertBefore(wrapButtonInContainer(editButton), container.firstChild);
                    }
                }

                if (USER_NOTES[noteKey] !== undefined) {
                    setBranchNote(branch, USER_NOTES[noteKey]);
                }
            }
        }
    }
});

mainContentObserver.observe(document, {childList: true, subtree: true});
chrome.runtime.sendMessage({
    action: "FL_DN_requestNotes",
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message.action) return;

    if (!message.action.startsWith("FL_DN_")) return;

    if (message.action === "FL_DN_loadNotes") {
        debug("Loading notes...");
        console.debug(message.notes);
        USER_NOTES = message.notes;
    }
});
