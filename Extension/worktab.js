console.log("worktab");

function gotMessage(data, sender, sendReponse){
    console.log(data.template)
    if(data.template.matched){
        html = render(data.template.config)
        sendReponse({html:html});
        // $("*").html("")
        // $("*").html(html)
    }
}
chrome.runtime.onMessage.addListener(gotMessage);
