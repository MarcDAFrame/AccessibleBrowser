function set_javascript(onoff){
    var new_setting = (onoff ? "allow" : "block"); //true allow // false block
    chrome.contentSettings.javascript.set({'setting' : new_setting})
}