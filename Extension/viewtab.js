// console.log(server_url);
// while (true){
console.log("test")
chrome.runtime.onMessage.addListener(gotMessage);
// }

function gotMessage(data, sender, sendeReponse){
    console.log(data)
    // console.log(data.template)
    // if(data.template.matched){
    //     html = render(data.template.config)
    //     // console.log($("*").html())
    //     // page_html = $("*").html()
    //     // sendeReponse(page_html);
    //     sendeReponse({html:html});
    //     // $("*").html("")
    //     // $("*").html(html)
    // }
}