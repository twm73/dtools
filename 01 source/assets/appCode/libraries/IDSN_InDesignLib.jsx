/**
 * Clears all guides in the document.
 *
 * InDesign
 * @function clearAllGuides
 * @returns {void}
 */
function clearAllGuides() {
    app.activeDocument.guides.everyItem().remove();
}


/**
 * Unlocks all elements in the document.
 * @param {Document} [document] - Reference to the document, optional. If not provided, the operation will be performed on the active document.
 */
function unlockAll(document) {
    if (app.documents.length > 0) {
        if (arguments.length > 0) {
            document.pageItems.everyItem().locked = false;
        } else {
            app.activeDocument.pageItems.everyItem().locked = false;
        }
    }
}

/**
 * InDesign ExtendScript
 *
 * Displays all hidden objects (PageItems) in InDesign.
 * @param {Document} [document] - A reference to the document. If not provided, the operation is performed on the active document.
 * @return {undefined}
 */
function showAll(document) {
    if (arguments.length > 0) {
        document.pageItems.everyItem().visible = true;
        document.stories.everyItem().pageItems.everyItem().visible = true;
        document.stories.everyItem().groups.everyItem().pageItems.everyItem().visible = true;
    } else {
        app.activeDocument.pageItems.everyItem().visible = true;
        if (app.activeDocument.stories.everyItem().pageItems.everyItem().getElements().length > 0) app.activeDocument.stories.everyItem().pageItems.everyItem().visible = true;
        if (app.activeDocument.stories.everyItem().getElements().length > 0 && app.activeDocument.stories.everyItem().groups.everyItem().getElements().length > 0 && app.activeDocument.stories.everyItem().groups.everyItem().pageItems.everyItem().getElements().length > 0) {
            app.activeDocument.stories.everyItem().groups.everyItem().pageItems.everyItem().visible = true;
        }
    }
}

function confirmDialog(title, text, ok, cancel) {
    var confirmDialog, buttonsGroup;
    confirmDialog = new Window("dialog {'alignChildren': 'center'}", title);
    confirmDialog.add('statictext {text:"' + text + '"}');
    buttonsGroup = confirmDialog.add("group {'orientation':'row', 'alignment': 'center'}");
    confirmDialog.defaultElement = buttonsGroup.add("button {'text':'" + ok + "'}");
    confirmDialog.cancelElement = buttonsGroup.add("button {'text':'" + cancel + "'}");
    return confirmDialog.show();
}
function backupAllDocuments() {
    var backUpFolder, tempFile, progressBar, userAnswer;
    if (app.books.length > 0) {
        userAnswer = confirmDialog(
            getTextFromVocabulary('backup_all_documents__confirm_dialog_title'),
            getTextFromVocabulary('backup_all_documents__confirm_dialog_text_for_book'),
            getTextFromVocabulary('backup_all_documents__confirm_dialog_ok'),
            getTextFromVocabulary('backup_all_documents__confirm_dialog_cancel')
        );
        if (userAnswer === 1) {
            backUpFolder = new Folder(app.activeBook.bookContents[0].filePath + "/BackUp/" + getFormattedDate('forFolderName'));
            if (!backUpFolder.exists) backUpFolder.create();
            progressBar = new SingleProgressBar(
                getTextFromVocabulary("progress_bar__name"),
                getTextFromVocabulary("progress_bar__text"),
                app.activeBook.bookContents.length + 1
            );

            tempFile = new File(app.activeBook.fullName);
            tempFile.copy(backUpFolder.fullName + "/" + tempFile.name);
            progressBar.nextStep(1);

            for (var i = 0; i < app.activeBook.bookContents.length; i++) {
                tempFile = new File(app.activeBook.bookContents[i].fullName);
                tempFile.copy(backUpFolder.fullName + "/" + tempFile.name);
                progressBar.nextStep(1);
            }
            progressBar.end();
        }
    } else if (app.documents.length > 0) {
        userAnswer = confirmDialog(
            getTextFromVocabulary('backup_all_documents__confirm_dialog_title'),
            getTextFromVocabulary('backup_all_documents__confirm_dialog_text_for_document'),
            getTextFromVocabulary('backup_all_documents__confirm_dialog_ok'),
            getTextFromVocabulary('backup_all_documents__confirm_dialog_cancel')
        );
        if (userAnswer === 1) {
            backUpFolder = new Folder(app.activeDocument.filePath + "/BackUp/" + getFormattedDate('forFolderName'));
            if (!backUpFolder.exists) backUpFolder.create();
            tempFile = new File(app.activeDocument.fullName);
            tempFile.copy(backUpFolder.fullName + "/" + tempFile.name);
        }
    }
}


/**
 * InDesign ExtendScript
 *
 * Rozgrupowuje wszystkie grupy w dokumencie.
 */
function ungroupAllInDocument() {
    var allGroups, counter;
    if (app.documents.length > 0) {
        allGroups = app.activeDocument.groups;
        counter = allGroups.length;
        for (var i = allGroups.length - 1; i >= 0; i--) {
            if (String(allGroups[i].textWrapPreferences.textWrapOffset) === "NOTHING" && String(allGroups[i].textWrapPreferences.textWrapMode) === "NONE") {
                allGroups[i].ungroup();
            }
        }
        if (counter !== app.activeDocument.groups.length) ungroupAllInDocument()
    }
}



/**
 * Adds a text frame with the specified text to the first page of the active document.
 *
 * @param {string} text - The text to be added to the text frame.
 */
function addTextFrameWithText(text) {
    if (app.documents.length > 0) {
        var textFrame = app.activeDocument.pages[0].textFrames.add(app.activeDocument.layers[0]);
        textFrame.geometricBounds = [
            app.activeDocument.pages[0].bounds[0] + app.activeDocument.pages[0].bounds[2] * 0.1,
            app.activeDocument.pages[0].bounds[1] + app.activeDocument.pages[0].bounds[3] * 0.1,
            app.activeDocument.pages[0].bounds[2] * 0.9,
            app.activeDocument.pages[0].bounds[3] * 0.9
        ];
        textFrame.texts[0].contents = text;
    }

}


/**
 * Creates a test document with various shapes and guides.
 *
 * @return {void}
 */
function createTestDocument() {
    app.documents.add();
    app.activeDocument.name = 'Test';
    addRectangle([10, 10], [20, 30], app.activeDocument.colors[3]).locked = true;
    addRectangle([40, 30], [20, 10], app.activeDocument.colors[4]).locked = true;
    addRectangle([60, 110], [25, 60], app.activeDocument.colors[5]).visible = false;
    addRectangle([100, 50], [70, 30], app.activeDocument.colors[6]).visible = false;
    app.activeDocument.groups.add([
        addRectangle([120, 10], [15, 30], app.activeDocument.colors[7]),
        addRectangle([130, 30], [44, 10], app.activeDocument.colors[8])
        ]);
    addTextFrameWithText('Test document');
    app.activeDocument.guides.add(undefined, {orientation: HorizontalOrVertical.horizontal, location: 20});
    app.activeDocument.guides.add(undefined, {orientation: HorizontalOrVertical.horizontal, location: 50});
    app.activeDocument.guides.add(undefined, {orientation: HorizontalOrVertical.vertical, location: 20});
    app.activeDocument.guides.add(undefined, {orientation: HorizontalOrVertical.vertical, location: 80});
}

/**
 * Adds a rectangle to the page.
 *
 * @param {Array.<number>} position - The position of the top-left corner of the rectangle. [x, y]
 * @param {Array.<number>} size - The width and height of the rectangle. [width, height]
 * @param {Object} color - The color of the rectangle. An Indesign Color object.
 * @returns {Object} - The created rectangle object.
 */
function addRectangle(position, size, color) {
    var verifiedColor;
    if(color.isValid) verifiedColor = color; else verifiedColor = app.activeDocument.colors[1];
    return app.activeDocument.pages[0].rectangles.add({
        geometricBounds: [position[1], position[0], position[1] + size[1], position[0] + size[0]],
        fillColor: verifiedColor
    });
}