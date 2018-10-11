

function new_url_listener(tabId, info, tab) {
    if(info.url){
        console.log(info.url);
        get_template(info.url).then(function(template){
            console.log(template);
            if (template){
                chrome.tabs.sendMessage(tab.id, {template: template}, function(response) {
                    if(response) {
                        //We do something
                        console.log("response receieved")
        
                    }
                });
            }        
        })
        // console.log(tab.status);
    }
}


chrome.tabs.onUpdated.addListener(new_url_listener);

