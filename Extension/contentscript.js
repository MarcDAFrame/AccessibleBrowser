console.log(server_url);
// while (true){
chrome.runtime.onMessage.addListener(gotMessage);
// }

function gotMessage(data, sender, sendeReponse){
    console.log(data.template)
    if(data.template.matched){
        render(data.template.config);
    }
}