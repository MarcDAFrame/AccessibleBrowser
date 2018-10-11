
function send_message(tab, message){

}

function new_url_listener(tabId, info, tab) {

    if(info.url){
        get_template(info.url).then(function(template){
            console.log(template);
            if (template){
                // console.log("send message");
                chrome.tabs.sendMessage(tab.id, {test:"test"}, function(response) {    
                    console.log(response);
                });
            }        
        })
        // console.log(t);
    }
}



chrome.tabs.onUpdated.addListener(new_url_listener);

