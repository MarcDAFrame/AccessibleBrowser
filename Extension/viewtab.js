console.log("viewtab")

function gotMessage(data, sender, sendReponse){
    // console.log(data)
    if(data != undefined){
        html = data.html
        $("*").html(html)
    }
    // console.log(data.template)
    // if(data.template.matched){
    //     html = render(data.template.config)
    //     // console.log($("*").html())
    //     // page_html = $("*").html()
    //     // sendeReponse(page_html);
    //     sendReponse({html:html});
    //     // $("*").html("")
    //     // $("*").html(html)
    // }
}
chrome.runtime.onMessage.addListener(gotMessage);
