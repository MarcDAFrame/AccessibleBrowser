function init(){
    return new Promise((res, rej) =>{
        chrome.tabs.create({pinned:true, url:"https://www.mframe.ca/worktab"}, function(worktab){
            chrome.tabs.create({pinned:true, url:"https://www.mframe.ca/viewtab"}, function(viewtab){
                chrome.tabs.update(viewtab.id, {active: true});
                chrome.tabs.onUpdated.addListener(function (tabId , info) {
                    if (info.status === 'complete' && tabId == viewtab.id) {
                        chrome.tabs.sendMessage(tabId, {test: "test"}, function(response){
                            
                        });  
                        res({worktab:worktab, viewtab:viewtab}); 
                    }
                });
            })
        });
    })

}
init().then((ret) => {
    worktab = ret.worktab
    viewtab = ret.viewtab
    worktab_change_listener = function(tabId, info, tab){
        if (info.url && tabId == worktab.id){
            console.log(info.url);
            get_template(info.url).then(data => {
                chrome.tabs.sendMessage(worktab.id, {template: data}, function(worktab_response){
                    if(worktab_response != undefined){
                        html = worktab_response.html;
                        chrome.tabs.sendMessage(viewtab.id, {html:html}, function(viewtab_response){

                        })
                    }
                });
            });

        }
    }
    chrome.tabs.onUpdated.addListener(worktab_change_listener);

});
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

