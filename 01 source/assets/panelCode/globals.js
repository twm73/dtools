const csInterface = new CSInterface();
const extensionFolder = csInterface.getSystemPath(SystemPath.EXTENSION);
let extensionConfigPublisherFolder = csInterface.getSystemPath(SystemPath.USER_DATA)
    + "/" + defaultConfig.publisher;
let extensionConfigFolder = extensionConfigPublisherFolder + "/" + defaultConfig.appLabelKey;
let extensionConfigPath = extensionConfigFolder + "/config.json";
let extensionLogPath = extensionConfigFolder + "/" + defaultConfig.logFileName;
let updateTested = false;
let keyboardShortcutsIsInitialised = false;
let configPathInSessionObjectIsSet = false;