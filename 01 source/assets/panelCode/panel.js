/**
 * Refreshes the extension's UI based on data from the configuration object.
 *
 * @function updateUI
 * @returns {void}
 */
function updateUI() {
    csInterface.setPanelFlyoutMenu(getFlyoutMenu());
    csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", flyoutMenuActions);
    configPathInSessionObjectIsSet || setConfigPathInSessionObject();
    keyboardShortcutsIsInitialised || copyScriptsFilesForShortcuts();
    $('#app').empty();
    addGuiElements(uiConfig.guiElements, 'app');
    if (!updateTested) {
        getVersion();
    }
    showStatus();
}


/**
 * Function for adding GUI elements.
 * @param {Array} elements - an array of GUI elements to be added.
 * @param {String} parentId - ID of the parent element where the elements will be added.
 */
function addGuiElements(elements, parentId) {
    for (let i = 0; i < elements.length; i++) {
        /**
         * Sprawdzenie, czy element jest zgodny z uruchomioną aplikacją.
         */
        if (elements[i].apps.join(' ').indexOf(csInterface.hostEnvironment.appName) !== -1) {
            switch (elements[i].type) {
                case 'switchablePanels':
                    addSwitchablePanels(elements[i], parentId);
                    break;
                case 'container':
                    addContainer(elements[i], parentId);
                    break;
                case 'line':
                    addLine(elements[i], parentId);
                    break;
                case 'textLabel':
                    addTextLabel(elements[i], parentId);
                    break;
                case 'dropDownList':
                    addDropDownList(elements[i], parentId);
                    break;
                case 'image':
                    addImage(elements[i], parentId);
                    break;
                case 'dropDownListItem':
                    break;
                case 'textButton':
                    addTextButton(elements[i], parentId);
                    break;
                case 'iconButton':
                    addIconButton(elements[i], parentId);
                    break;
                case 'minesweeper':
                    runMinesweeper(parentId);
                    break;

            }
        }
    }
}


/**
 * Adds a {@link SwitchablePanels} element to the specified parent.
 *
 * @param {SwitchablePanels} elementConfig - The configuration object of the element.
 * @param {String} parentId - The ID of the parent to which the element should be added.
 *
 * @returns {void}
 */
function addSwitchablePanels(elementConfig, parentId) {
    if (elementConfig.children.length < 2) return;
    let config = getConfig();
    $('#' + parentId).append('<div id="' + elementConfig.name + '">');
    addCssClass(elementConfig.name, elementConfig.cssClass);
    /**
     * Filters the selected elements based on the given element name.
     *
     * @param {Array} config.selectedElements - The array of selected elements.
     * @param {Object} elementConfig - The element configuration object.
     * @param {string} elementConfig.name - The name of the element to filter.
     * @returns {Array} - The filtered array of selected elements with the matching element name.
     */
    let settings = config.selectedElements.filter((element) => {
        return element.name === elementConfig.name
    });
    let selected = 0;
    if (settings.length === 0) {
        config.selectedElements.unshift({
            'name': elementConfig.name,
            'selected': 0,
            'text': getTextFromVocabulary(elementConfig.children[0].text)
        });
        saveConfig(config);
    } else {
        selected = settings[0].selected;
    }
    /**
     * Container for buttons and a separate one for the panel
     */
    $('#' + elementConfig.name).append('<div id="' + elementConfig.name + 'Buttons">').append('<div id="' + elementConfig.name + 'Content">');
    addCssClass(elementConfig.name + 'Content', ['switchablePanelsContentContainer']);
    /**
     * Przyciski kontrolujące wybor panelu.
     */
    for (let i = 0; i < elementConfig.children.length; i++) {
        let buttonId = elementConfig.name + 'Button' + i;
        $('#' + elementConfig.name + 'Buttons').append($('<button>'
            + getTextFromVocabulary(elementConfig.children[i].text)
            + '</button>').attr('id', buttonId));
        if (selected === i) addCssClass(buttonId, elementConfig.cssButtonOnClass);
        else addCssClass(buttonId, elementConfig.cssButtonOffClass);
        $('#' + buttonId).click(() => {
            let config = getConfig();
            config.selectedElements.filter((element) => {
                return element.name === elementConfig.name
            })[0].selected = i;
            config.selectedElements.filter((element) => {
                return element.name === elementConfig.name
            })[0].text = $('#' + buttonId).empty().text();
            persistConfig(config);
        });
        if (i === 0) addCssClass(buttonId, ['switchablePanelsLeftButton']);
        else if (i === elementConfig.children.length - 1) addCssClass(buttonId, ['switchablePanelsRightButton']);
        else addCssClass(buttonId, ['switchablePanelsMiddleButton']);
    }
    /**
     *  Adding child elements of the active panel.
     */
    addGuiElements([elementConfig.children[selected]], elementConfig.name + 'Content');
}

/**
 * Adds a {@link Container} element to the specified parent.
 * @param {Container} elementConfig - Object with the element configuration
 * @param {String} parentId - ID of the parent to which the element should be added
 */
function addContainer(elementConfig, parentId) {
    $('#' + parentId).append($('<div>').attr('id', elementConfig.name));
    addCssClass(elementConfig.name, elementConfig.cssClass);
    addGuiElements(elementConfig.children, elementConfig.name);
}

/**
 * Adds an element of type {@link Line} to the specified parent.
 *
 * @param {Line} elementConfig - The object containing the element configuration.
 * @param {String} parentId - The ID of the parent to which the element should be added.
 *
 * @return {void}
 */
function addLine(elementConfig, parentId) {
    $('#' + parentId).append($('<div>').attr('id', elementConfig.name));
    addCssClass(elementConfig.name, elementConfig.cssClass);
}

/**
 * Adds a {@link TextLabel} element to the specified parent.
 *
 * @param {TextLabel} elementConfig - The configuration object of the element.
 * @param {String} parentId - The ID of the parent to which the element should be added.
 *
 * @return {undefined}
 */
function addTextLabel(elementConfig, parentId) {
    $('#' + parentId).append(
        $('<p>').html(getTextFromVocabulary(elementConfig.text))
            .attr('id', elementConfig.name)
    );
    addCssClass(elementConfig.name, elementConfig.cssClass);
}

/**
 * Adds a button of type {@link IconButton} with an icon from the [Material Design](https://fonts.google.com/icons) set that triggers a specified action in ExtendScript.
 *
 * @param {IconButton} elementConfig - The configuration object for the element.
 * @param {String} parentId - The ID of the parent element to which the button should be added.
 */
function addIconButton(elementConfig, parentId) {
    let text = getTextFromVocabulary(elementConfig.toolTipText);
    $('#' + parentId).append(
        $('<button>').attr('id', elementConfig.name)
            .attr('title', text)
            .text(elementConfig.iconCode)
    );
    addCssClass(elementConfig.name, elementConfig.cssClass);
    $('#' + elementConfig.name)
        .click({script: elementConfig.adobeScript}, buttonRunAction)
        .mouseover(() => {
            $('#tooltip').text(text);
            document.getElementById("tooltip").style.visibility = "visible";
        })
        .mouseleave(() => {
            $('#tooltip').empty();
            document.getElementById("tooltip").style.visibility = "hidden";

        })
    ;
}

/**
 * Adds a {@link TextButton} with a text name that triggers an assigned action in ExtendScript.
 *
 * @param {TextButton} elementConfig - The object with the element configuration.
 * @param {String} parentId - The ID of the parent element where the button should be added.
 *
 * @return {undefined}
 */
function addTextButton(elementConfig, parentId) {
    let text = getTextFromVocabulary(elementConfig.toolTipText);
    $('#' + parentId).append(
        $('<button>').attr('id', elementConfig.name)
            .attr('title', text)
            .text(getTextFromVocabulary(elementConfig.text))
    );
    addCssClass(elementConfig.name, elementConfig.cssClass);
    $('#' + elementConfig.name)
        .click({script: elementConfig.adobeScript}, buttonRunAction)
        .mouseover(() => {
            $('#tooltip').text(text);
            document.getElementById("tooltip").style.visibility = "visible";
        })
        .mouseleave(() => {
            $('#tooltip').empty();
            document.getElementById("tooltip").style.visibility = "hidden";

        })
    ;
}

/**
 * Adds a dropdown list element of type {@link DropDownList} with a text name that triggers an assigned action in ExtendScript.
 *
 * @param {DropDownList} elementConfig - The object with element configuration.
 * @param {String} parentId - The ID of the parent to which the element should be added.
 */
function addDropDownList(elementConfig, parentId) {
    let config = getConfig();
    let settings = config.selectedElements.filter((element) => {
        return element.name === elementConfig.name
    });
    let selected = 0;
    if (settings.length === 0) {
        config.selectedElements.unshift({
            'name': elementConfig.name,
            'selected': 0,
            'text': getTextFromVocabulary(elementConfig.items[0].text)
        });
        saveConfig(config);
    } else {
        selected = settings[0].selected;
    }
    let items = elementConfig.items.map((el, index) => {
        return $('<option>')
            .attr('value', index)
            .attr('Selected', (index === selected))
            .text(getTextFromVocabulary(el.text));
    });
    let dropdownList = $('<select>').attr('id', elementConfig.name)
        .on('change', () => {
            var config = getConfig();
            config.selectedElements.filter((element) => {
                return element.name === elementConfig.name
            })[0].selected
                = $('#' + elementConfig.name).find('option:selected').index();

            config.selectedElements.filter((element) => {
                return element.name === elementConfig.name
            })[0].text
                = $('#' + elementConfig.name).find('option:selected').text();

            persistConfig(config);
        });
    $('#' + parentId).append(dropdownList.append(items));
    addCssClass(elementConfig.name, elementConfig.cssClass);
}

function addImage(elementConfig, parentId) {
    $('#' + parentId).append(
        '<img src="'+ extensionFolder +  elementConfig.path +'" alt="DT Tools logo" class="logo"/>'
    )
}

/**
 * Adds the passed CSS class names to the specified element.
 * @param {String} elementId - The id of the element.
 * @param {String[]} classArray - An array of class names.
 */
function addCssClass(elementId, classArray) {
    classArray.map(function (element) {
        $('#' + elementId).addClass(element);
    });
}

/**
 * Retrieves the specified text from the vocabulary in the current language.
 *
 * @param {String} textName - The textual label identifying the text in the vocabulary.
 * @returns {string} - The text from the vocabulary.
 */
function getTextFromVocabulary(textName) {
    return dictionary.languages[getConfig().language].panel_ui[textName] || '!!! ' + textName;
}

/**
 * Checks for version compatibility. Returns `false` if a newer version of the extension is available online.
 * @param {defaultConfig} config - The configuration object containing current and update versions.
 * @return {boolean} - Returns `true` if the current version is compatible with the update version, otherwise `false`.
 */
function extensionVersionCompatibility(config) {
    if (config.appVersions.current.major < config.appVersions.update.major) {
        return false;
    } else if (
        config.appVersions.current.major === config.appVersions.update.major
        && config.appVersions.current.minor < config.appVersions.update.minor
    ) {
        return false;
    } else if (
        config.appVersions.current.major === config.appVersions.update.major
        && config.appVersions.current.minor === config.appVersions.update.minor
        && config.appVersions.current.patch < config.appVersions.update.patch
    ) {
        return false;
    }
    return true;
}

/**
 * Checks if the extension version stored in the configuration file is different from the version fetched from the server.
 * If so, modifies it in config.appVersions.update and saves the configuration.
 * @param {string} versionObjectJsonString - The JSON string representation of the version object.
 * @return {void}
 */
function saveVersion(versionObjectJsonString) {
    let versionObject;
    console.log('saveVersion');
    try {
        versionObject = JSON.parse(versionObjectJsonString);
    } catch (e) {
        versionObject = {
            isValid: false
        };
        console.log('saveVersion Error!');
    }
    if (versionObject.isValid) {
        console.log(versionObjectJsonString);
        const config = getConfig();

        config.appVersions.update.major = versionObject.currentVersion.major;
        config.appVersions.update.minor = versionObject.currentVersion.minor;
        config.appVersions.update.patch = versionObject.currentVersion.patch;

        if (!extensionVersionCompatibility(config)) {
            console.log('save');
            saveConfig(config);
        }
    }
}

/**
 * Retrieves text content from the given URL through HTTP.
 * @param {string} url - The URL in the format "http://www..."
 * @param {function} callback - The callback function to handle the retrieved text content
 */
function loadFileFromUrl(url, callback) {
    const xhr = new XMLHttpRequest();
    console.log('loadFileFromUrl ' + url)
    xhr.callback = callback;
    xhr.onload = function () {
        console.log('loadFileFromUrl ok: ' + this.responseText);
        updateTested = true;
        this.callback(this.responseText);
    };
    xhr.onerror = function () {
        saveToLog(['loadFileFromUrl', url, this.statusText], 'FATAL');
        console.error('loadFileFromUrl Err: ' + this.statusText);
    };

    xhr.open("GET", url, true);
    xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
    xhr.send(null);
}

/**
 * Returns the current version of the application from the server.
 * @returns {undefined}
 * @see loadFileFromUrl
 * @see saveVersion
 */
function getVersion() {
    const config = getConfig();
    if (config.serverAddress !== '') {
        loadFileFromUrl(config.serverAddress + "/download/version/" + config.appId + "/latest", saveVersion);
    } else {
        updateTested = true;
    }
}

/**
 * Displays the content of the status field.
 *
 * @returns {void}
 */
function showStatus() {
    const config = getConfig();
    $('#statusBar').empty();
    // version
    $('#statusBar').append('<div id="versionStatus">');
    if (extensionVersionCompatibility(config)) {
        $('#versionStatus').addClass('statusOk');
        $('#versionStatus').append('<p id="versionStatement">' + getTextFromVocabulary('status_bar__extension_version') +
            config.appVersions.current.major + '.' + config.appVersions.current.minor + '.' + config.appVersions.current.patch
            + '</p>');
    } else {
        $('#versionStatus').addClass('statusAlert');
        $('#versionStatus').append('<p id="versionStatement">' + getTextFromVocabulary('status_bar__update_available') +
            config.appVersions.update.major + '.' + config.appVersions.update.minor + '.' + config.appVersions.update.patch
            + '</p>');
    }
}

function BoardSquare(index) {
    this.mine = false;
    this.active = true;
    this.squareId = 'square-' + index;
    this.index = Number(index);
    this.visible = false;
    this.flag = false;
    this.unknown = false;
    this.adjacentMines = 0;
    this.reset = function () {
        this.active = true;
        this.mine = false;
        this.visible = false;
        this.flag = false;
        this.adjacentMines = 0;
        this.unknown = false;
    }
    this.getText = function () {
        if (this.visible) {
            if (this.mine) return '<span class="boardIcons">bomb</span>';
            if (this.adjacentMines > 0) return '<span class="boardText">' + this.adjacentMines + '</span>';
        } else {
            if (this.flag) return '<span class="boardIcons">flag</span>';
            else if (this.unknown) return '<span class="boardText">?</span>';
        }
        return '<span></span>';
    }
}
let timer;
function runMinesweeper(containerId) {
    const main = this;
    /**
     *
     * @type {BoardSquare[]}
     */
    let boardArray = [];
    let gameRun = true;
    let rows = 10;
    let listeners = [];
    let columns = 10;
    let mines = 10;
    let flags = 0;
    let questionMarks = 0;
    let unknownSquares = columns * rows;
    let score = 0;
    let time = true;

    const mainContainer = document.getElementById(containerId);
    window.oncontextmenu = function (evt) {
        evt.preventDefault();
    };
    $('#' + containerId).empty().append('<div id="gameContainer"></div>');

    const gameContainer = $('#gameContainer');
    gameContainer.append('<div id="gameStatusPanel"></div>');
    gameContainer.append('<div id="gameBoard"></div>');
    gameContainer.append('<div id="gameButtonsPanel"></div>');
    $('#gameButtonsPanel').append('<button id="restartButton">Restart game</button>').on('click', ()=>{main.resetGame();});
    const statusContainer = $('#gameStatusPanel');
    statusContainer.append('<div id="minesCounter"></div>');
    statusContainer.append('<div id="face"></div>').on('click', ()=>{main.resetGame();});
    statusContainer.append('<div id="time"></div>');

    this.disableAllSquares = function () {
        for (let i = 0; i < boardArray.length; i++) {
            boardArray[i].active = false;
        }
    }

    this.clearBoardArray = function () {
        $('#restartButton').empty().text(getTextFromVocabulary('minesweeper_restart_game'));
        for (let i = 0; i < columns * rows; i++) {
            let square = $('#' + boardArray[i].squareId);
            boardArray[i].reset();
            square.empty();
            square.addClass('boardSquare');
            square.addClass('hidden');
            square.removeClass('visible');
            square.removeClass('wrongMarking');
            if(listeners[i] instanceof Array  && listeners[i].length > 1) {
                square.off('click', listeners[i][0]);
                square.off('contextmenu', listeners[i][1]);
            }
        }
    }
    this.initBoardArray = function () {
        let mainContainersWidth = (columns * 24) + 'px';
        for (let i = 0; i < columns * rows; i++) {
            boardArray[i] = new BoardSquare(i);
        }
        $('#gameBoard')
            .css('width', mainContainersWidth)
            .css('height', (rows * 24) + 'px')
            .css('padding', '10px')
        ;
        $('#gameButtonsPanel')
            .css('width', mainContainersWidth)
            .css('padding', '0 10px')
        ;
        $('#gameStatusPanel')
            .css('width', mainContainersWidth)
            .css('padding', '0 10px')
        ;
        let displaysWidth = ((columns * 25 - 40 - 10 - 40) / 2) + 'px';
        $('#minesCounter').css('width', displaysWidth);
        $('#time').css('width', displaysWidth);
    }
    this.addMines = function () {
        let draw = 0;
        do {
            let tempIndex = Math.floor(Math.random() * columns * rows);
            if (!boardArray[tempIndex].mine) {
                boardArray[tempIndex].mine = true;
                draw++;
            }
        } while (draw < mines);
    }
    this.showAdjacentSquares = function (squareObj) {
        const indexes = [];
        let x = squareObj.index % columns;
        let y = Math.floor(squareObj.index / rows);
        if(y-1>=0) {
            if (x - 1 >= 0) xy(x-1, y-1);
            xy(x, y-1);
            if (x + 1 < columns) xy(x+1, y-1);
        }
        if (x - 1 >= 0) xy(x-1, y);
        if (x + 1 < columns) xy(x+1, y);
        if(y+1<rows) {
            if (x - 1 >= 0) xy(x-1, y+1);
            xy(x, y+1);
            if (x + 1 < columns) xy(x+1, y+1);
        }
        for (let i = 0; i < indexes.length; i++) {
            let element = boardArray[indexes[i]];
            if(element.visible === false && element.flag === false && element.unknown === false) {
                showSquare(element);
                if (element.adjacentMines === 0) main.showAdjacentSquares(element);
            }
        }
        function xy(x, y) {
            indexes.push(y * columns + x);
        }
    }
    this.checkAdjacentMines = function () {
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
                let tempElement = boardArray[rowIndex * columns + columnIndex];
                for (let i = rowIndex - 1; i <= rowIndex + 1; i++) {
                    for (let j = columnIndex - 1; j <= columnIndex + 1; j++) {
                        if (i >= 0 && i < rows && j >= 0 && j < columns) {
                            if (boardArray[i * columns + j].mine) {
                                tempElement.adjacentMines++;
                            }
                        }
                    }
                }
            }
        }
    }
    this.makeBoard = function () {
        listeners = [];
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
                let index = rowIndex * columns + columnIndex;
                let squareId = 'square-' + index;
                $('#gameBoard').append(
                    '<div id="' + squareId + '">'
                );
                let square = $('#' + squareId);
                square.append(boardArray[index].getText());
                square.addClass('boardSquare');
                square.removeClass('visible');
                square.addClass('hidden');
                listeners[index] = [
                    revealClick(boardArray[index]),
                    flagClick(boardArray[index])
                ];
                square.on('click', listeners[index][0]);
                square.on('contextmenu', listeners[index][1]);
            }
        }
    }
    this.resetGame = function () {
        unknownSquares = columns * rows;
        runTimer();
        gameRun = true;
        score = 0;
        flags = 0;
        $('#time').empty().text(score);
        this.clearBoardArray();
        this.addMines();
        this.checkAdjacentMines();
        this.makeBoard();
        $('#face').empty().append(
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
            '\t viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">\n' +
            '<style type="text/css">.st0{fill:#FFED00;}.st1{fill:#1D1D1B;}</style>\n' +
            '<circle class="st0" cx="12" cy="12" r="8.8"/>\n' +
            '<path class="st1" d="M7.5,12.6L11,10L7.5,7.4L6.6,8.6L8.5,10l-1.9,1.4L7.5,12.6z M16.6,12.6l0.9-1.2l-2-1.4l1.9-1.4l-0.9-1.2L13,10\n' +
            '\tL16.6,12.6z M10.5,17l1.5-1.5l1.5,1.5l1.5-1.5l1,1l1-1l-2-2L13.5,15L12,13.4l-1.5,1.5L9,13.4l-2,2l1.1,1l1-1L10.5,17z M12,22\n' +
            '\tc-1.4,0-2.7-0.3-3.9-0.8S5.8,20,4.9,19.1s-1.6-2-2.1-3.2S2,13.4,2,12s0.3-2.7,0.8-3.9S4,5.8,4.9,4.9s2-1.6,3.2-2.1S10.6,2,12,2\n' +
            '\ts2.7,0.3,3.9,0.8s2.3,1.2,3.2,2.1s1.6,2,2.1,3.2S22,10.6,22,12s-0.3,2.7-0.8,3.9s-1.2,2.3-2.1,3.2s-2,1.6-3.2,2.1S13.4,22,12,22z\n' +
            '\t M12,20c2.2,0,4.1-0.8,5.7-2.3c1.5-1.6,2.3-3.4,2.3-5.7s-0.8-4.1-2.3-5.7C16.1,4.8,14.2,4,12,4S7.9,4.8,6.3,6.3S4,9.8,4,12\n' +
            '\ts0.8,4.1,2.3,5.7C7.9,19.2,9.8,20,12,20z"/>\n' +
            '</svg>\n'
        );
        minesStatusUpdate();
    }
    function lostGame() {
        gameRun = false;
        clearInterval(timer);
        $('#face').empty().append(
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
            '\t viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">\n' +
            '<style type="text/css">\n' +
            '\t.st0{fill:#FFED00;}\n' +
            '</style>\n' +
            '<circle class="st0" cx="12" cy="12" r="8.8"/>\n' +
            '<path d="M9.8,18c0.3,0,0.6,0,0.8-0.1c0.3-0.1,0.5-0.2,0.8-0.4c0.1-0.1,0.2-0.1,0.3-0.2c0.1-0.1,0.2-0.1,0.3-0.1\n' +
            '\tc0.1,0,0.4,0.1,0.7,0.2c0.2,0.1,0.5,0.2,0.8,0.4c0.3,0.1,0.5,0.1,0.8,0.1c0.8,0,1.5-0.3,2-0.9c0.5-0.6,0.8-1.4,0.8-2.4\n' +
            '\tc0-1.2-0.4-2.1-1.2-2.8s-2-1-3.6-1h-0.4c-1.6,0-2.7,0.3-3.6,1S7,13.5,7,14.7c0,1,0.3,1.8,0.8,2.4C8.3,17.7,8.9,18,9.8,18z M9.8,16.5\n' +
            '\tc-0.4,0-0.7-0.2-0.9-0.5c-0.2-0.3-0.3-0.7-0.3-1.3c0-0.8,0.3-1.3,0.8-1.7c0.5-0.4,1.4-0.6,2.5-0.6h0.4c1.1,0,2,0.2,2.5,0.6\n' +
            '\tc0.5,0.4,0.8,0.9,0.8,1.7c0,0.6-0.1,1-0.3,1.3c-0.2,0.3-0.5,0.5-0.9,0.5c-0.2,0-0.5-0.1-0.9-0.3c-0.2-0.1-0.4-0.2-0.7-0.3\n' +
            '\tc-0.2-0.1-0.5-0.1-0.7-0.1s-0.5,0-0.7,0.1c-0.2,0.1-0.5,0.2-0.7,0.3c-0.1,0.1-0.3,0.2-0.4,0.2S9.9,16.5,9.8,16.5z M6.3,10.7\n' +
            '\tc1-0.4,1.8-0.8,2.4-1.3c0.6-0.5,1.2-1.1,1.7-2L9.1,6.6C8.7,7.3,8.2,7.8,7.8,8.2C7.3,8.5,6.6,8.9,5.7,9.3L6.3,10.7z M17.7,10.7\n' +
            '\tl0.6-1.4c-0.9-0.4-1.6-0.7-2-1.1c-0.5-0.4-0.9-0.9-1.4-1.6l-1.2,0.8c0.5,0.8,1.1,1.5,1.7,2C15.9,9.8,16.7,10.3,17.7,10.7z M12,22\n' +
            '\tc-1.4,0-2.7-0.3-3.9-0.8c-1.2-0.5-2.3-1.2-3.2-2.1s-1.6-2-2.1-3.2S2,13.4,2,12c0-1.4,0.3-2.7,0.8-3.9S4,5.8,4.9,4.9s2-1.6,3.2-2.1\n' +
            '\tS10.6,2,12,2s2.7,0.3,3.9,0.8s2.3,1.2,3.2,2.1s1.6,2,2.1,3.2C21.7,9.3,22,10.6,22,12c0,1.4-0.3,2.7-0.8,3.9\n' +
            '\tc-0.5,1.2-1.2,2.3-2.1,3.2s-2,1.6-3.2,2.1C14.7,21.7,13.4,22,12,22z M12,20c2.2,0,4.1-0.8,5.7-2.3c1.5-1.6,2.3-3.4,2.3-5.7\n' +
            '\ts-0.8-4.1-2.3-5.7C16.1,4.8,14.2,4,12,4S7.9,4.8,6.3,6.3S4,9.8,4,12s0.8,4.1,2.3,5.7C7.9,19.2,9.8,20,12,20z"/>\n' +
            '</svg>\n'
        );
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            for (let i = 0; i < boardArray.length; i++) {
                let squareObj = boardArray[i];
                if(squareObj.mine && ! squareObj.visible){
                    $('#' + squareObj.squareId).empty().append('<?xml version="1.0" encoding="utf-8"?>\n' +
                        '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
                        '\t viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">\n' +
                        '<path d="M10,22c-1.9,0-3.5-0.7-4.8-2s-2-2.9-2-4.8s0.6-3.5,1.9-4.8S8.1,8.5,10,8.5h0.3l0.6-1.1c0.2-0.3,0.4-0.5,0.8-0.6\n' +
                        '\tc0.4-0.1,0.7,0,1,0.1l0.7,0.4l0.1-0.2c0.3-0.6,0.9-1.1,1.6-1.3c0.7-0.2,1.4-0.1,2.1,0.3L18,6.6l-0.9,1.6l-0.8-0.4\n' +
                        '\tc-0.2-0.1-0.4-0.1-0.7-0.1c-0.2,0.1-0.4,0.2-0.6,0.4l-0.1,0.2l0.9,0.5c0.3,0.2,0.5,0.4,0.6,0.8c0.1,0.4,0.1,0.7-0.1,1l-0.6,1.1\n' +
                        '\tc0.3,0.5,0.6,1.1,0.8,1.7c0.2,0.6,0.3,1.2,0.3,1.9c0,1.9-0.7,3.5-2,4.8S11.9,22,10,22z"/>\n' +
                        '<rect x="20" y="6.8" width="3" height="2"/>\n' +
                        '<rect x="14.5" y="0.3" width="2" height="3"/>\n' +
                        '<rect x="18.2" y="2.6" transform="matrix(0.7071 -0.7071 0.7071 0.7071 3.2619 14.9999)" width="3" height="2"/>\n' +
                        '</svg>\n');
                } else if(! squareObj.mine && squareObj.flag){
                    $('#' + squareObj.squareId).addClass('wrongMarking');
                }
            }
        }
        $('#restartButton').empty().text(getTextFromVocabulary('minesweeper_new_game'));
    }
    function winGame(){
        gameRun = false;
        $('#face').empty().append(
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
            '\t viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">\n' +
            '<style type="text/css">\n' +
            '\t.st0{fill:#FFED00;}\n' +
            '</style>\n' +
            '<circle class="st0" cx="12" cy="12" r="8.8"/>\n' +
            '<path d="M8,12v2c0,1.1,0.4,2,1.2,2.8C10,17.6,10.9,18,12,18s2-0.4,2.8-1.2C15.6,16,16,15.1,16,14v-2H8z M12,16.5\n' +
            '\tc-0.7,0-1.3-0.2-1.8-0.7c-0.5-0.5-0.7-1.1-0.7-1.8v-0.5h5V14c0,0.7-0.2,1.3-0.7,1.8C13.3,16.3,12.7,16.5,12,16.5z M8.5,7\n' +
            '\tC7.9,7,7.3,7.2,6.8,7.7C6.3,8.1,6,8.8,5.8,9.6l1.4,0.3c0.1-0.4,0.3-0.8,0.5-1C8,8.6,8.2,8.5,8.5,8.5S9,8.6,9.3,8.9\n' +
            '\tc0.2,0.3,0.4,0.6,0.5,1l1.4-0.3c-0.2-0.8-0.5-1.4-1-1.9C9.7,7.2,9.1,7,8.5,7z M15.5,7c-0.6,0-1.2,0.2-1.7,0.7\n' +
            '\tc-0.5,0.5-0.8,1.1-1,1.9l1.4,0.3c0.1-0.4,0.3-0.8,0.5-1c0.2-0.3,0.5-0.4,0.8-0.4s0.5,0.1,0.8,0.4c0.2,0.3,0.4,0.6,0.5,1l1.5-0.3\n' +
            '\tc-0.2-0.8-0.5-1.4-1-1.9C16.7,7.2,16.1,7,15.5,7z M12,22c-1.4,0-2.7-0.3-3.9-0.8c-1.2-0.5-2.3-1.2-3.2-2.1s-1.6-2-2.1-3.2\n' +
            '\tS2,13.4,2,12c0-1.4,0.3-2.7,0.8-3.9S4,5.8,4.9,4.9s2-1.6,3.2-2.1S10.6,2,12,2s2.7,0.3,3.9,0.8s2.3,1.2,3.2,2.1s1.6,2,2.1,3.2\n' +
            '\tC21.7,9.3,22,10.6,22,12c0,1.4-0.3,2.7-0.8,3.9c-0.5,1.2-1.2,2.3-2.1,3.2s-2,1.6-3.2,2.1C14.7,21.7,13.4,22,12,22z M12,20\n' +
            '\tc2.2,0,4.1-0.8,5.7-2.3c1.5-1.6,2.3-3.4,2.3-5.7s-0.8-4.1-2.3-5.7C16.1,4.8,14.2,4,12,4S7.9,4.8,6.3,6.3S4,9.8,4,12s0.8,4.1,2.3,5.7\n' +
            '\tC7.9,19.2,9.8,20,12,20z"/>\n' +
            '</svg>\n'
        );
        $('#restartButton').empty().text(getTextFromVocabulary('minesweeper_new_game'));
        clearInterval(timer);
    }
    function revealClick(squareObj) {
        return function () {
            if(gameRun && squareObj.active && !squareObj.flag && !squareObj.unknown) checkSquare(squareObj);
        }
    }

    function flagClick(squareObj) {
        return function () {
            if (gameRun && squareObj.active && !squareObj.visible) setFlagOrUnknown(squareObj);
        }
    }

    function setFlagOrUnknown(squareObj) {
        let square = $('#' + squareObj.squareId);
        square.empty();

        // sequence - > flag, question mark, empty
        if (squareObj.flag) {
            flags--;
            questionMarks++;
            squareObj.flag = false;
            squareObj.unknown = true;

        } else if (squareObj.unknown) {
            questionMarks--;
            squareObj.flag = false;
            squareObj.unknown = false;
        } else {
            flags++;
            squareObj.flag = true;
            squareObj.unknown = false;
        }
        square.append(squareObj.getText())
        minesStatusUpdate();
    }

    function checkSquare(squareObj) {
        if (!squareObj.visible) {
            showSquare(squareObj);
            if (squareObj.mine) {
                $('#' + squareObj.squareId).empty().append('<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-80q-33 0-56.5-23.5T120-160v-160q0-33 23.5-56.5T200-400h560q33 0 56.5 23.5T840-320v160q0 33-23.5 56.5T760-80H200Zm0-80h560v-160H200v160Zm61-300L60-574l240-40-65-235 199 141 120-212 40 240 235-65-141 199 152 86H678l-106-60 62-88-104 29-18-106-52 93-88-62 29 104-106 18 120 72H261Zm226 0Zm-7 220Z"/></svg>');
                lostGame();
            }
            else if(unknownSquares - mines ===0 && testWin()){
                winGame();
            }
            else if (squareObj.adjacentMines === 0){
                main.showAdjacentSquares(squareObj)
            }
        }
    }
    function testWin() {
        for (let i = 0; i < boardArray.length; i++) {
            if(! boardArray[i].visible && boardArray[i].flag && ! boardArray[i].mine) return false
        }
        return true;
    }

    function showSquare(squareObj) {
        if (!squareObj.visible) {
            unknownSquares--;
            squareObj.visible = true;
            let square = $('#' + squareObj.squareId);
            square.removeClass('hidden');
            square.addClass('visible');
            square.append(squareObj.getText())
        }
    }

    function runTimer() {
        clearInterval(timer);
        time = true;
        timer = setInterval(timerHandler, 1000)
    }

    function timerHandler() {
        if (gameRun) {
            if(score > 999) lostGame();
            else {
                score++;
                $('#time').empty().text(score);
            }
        }
    }

    function minesStatusUpdate() {
        $('#minesCounter').empty().text(mines - flags);
    }

    this.initBoardArray();
    this.resetGame();
}

