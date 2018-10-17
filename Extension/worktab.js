console.log("worktab");
function prepare_page(template){
    //turn off js
    //redirect page
}
function gotMessage(data, sender, sendResponse){
    // console.log(data.template)
    console.log(sender)
    if(data.from == "background"){
        if(data && data.template && data.template.matched){
            render(data.template.config).then((rendered) => {
                chrome.extension.sendMessage({from : "worktab", html:rendered.html, funcs:rendered.funcs}, function(background_response){

                })
            })
        }
    }

}
chrome.runtime.onMessage.addListener(gotMessage);
