function init(){
    chrome.tabs.create({pinned:true, url:"https://mframe.ca/worktab"}, function(worktab){
        chrome.tabs.create({pinned:true, url:"https://mframe.ca/viewtab"}, function(viewtab){
            chrome.tabs.update(viewtab.id, {active: true});
            chrome.tabs.onUpdated.addListener(function (tabId , info) {
                if (info.status === 'complete' && tabId == viewtab.id) {
                    chrome.tabs.sendMessage(tabId, {test: "test"}, function(response){
                        
                    });   
                }
            });
        })
    });
}
init();
// function new_url_listener(tabId, info, tab) {
//     if (info.url){
//         get_template(info.url).then(data => {
//             console.log("new website (" + data.matched + ")=> " + info.url);
//             chrome.tabs.sendMessage(tabId, {template: data}, function(response){
//                 console.log(response)
//                 // html = response.html
                
//                 console.log("hello world")

//                 // chrome.tabs.sendMessage(newTabId, {html: html}, function(response){

//             })
//         }, err => {
//             console.log("Error")
//             console.log(err)
//         })
        
//         url = info.url;
//     }

// }
// chrome.tabs.onUpdated.addListener(new_url_listener);

