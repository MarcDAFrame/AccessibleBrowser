chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"});
});
async function sendMessage(tabId, message){
    return new Promise((res, rej) => {
        chrome.tabs.sendMessage(tabId, message);
        res({});
    });
} 
function new_url_listener(tabId, info, tab) {
    if (info.url){
        console.log(info.url);
        get_template(info.url).then(template => {
            chrome.tabs.sendMessage(tabId, {template: template})
        })
        
        url = info.url;
    }

}



chrome.tabs.onUpdated.addListener(new_url_listener);

