// var a = $("p").text();
// console.log("test");
// console.log(a);
// $( ".TbwUpd" ).each(function( index ) {
    // console.log($(this).text());
// })
// test("hello")
// $("*").html("test");
console.log(server_url);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.greeting == "hello")
        sendResponse({farewell: "goodbye"});
});