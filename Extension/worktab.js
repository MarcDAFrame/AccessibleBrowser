console.log("worktab");
function prepare_page(template){
    //turn off js
    //redirect page
}
function gotMessage(data, sender, sendReponse){
    // console.log(data.template)
    console.log(sender)
    if(data && data.template && data.template.matched){
        render(data.template.config).then((html, funcs) => {
            
        })
        sendReponse({html:html});
        // $("*").html("")
        // $("*").html(html)
    }
}
chrome.runtime.onMessage.addListener(gotMessage);
