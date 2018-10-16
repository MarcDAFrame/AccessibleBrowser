function set_javascript(onoff){
    var new_setting = (onoff ? "allow" : "block"); //true allow // false block
    chrome.contentSettings.javascript.set({'setting' : new_setting})
}
function set_setting(setting, value){
    var obj = {}
    obj[setting] = value
    chrome.storage.sync.set(obj);
}
function get_setting(setting){
    return new Promise((res, rej)=>{
        chrome.storage.sync.get(setting, function(data) {
            res(data)
        })
    })
}

function get_all_settings(){
    all = [""]
    out = {}
    for (i in all){
        out[all[i]] = all[i]
    }
    
    return out
}

function set_default(){

}