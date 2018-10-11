// var a = $("p").text();
// console.log("test");
// console.log(a);
// $( ".TbwUpd" ).each(function( index ) {
    // console.log($(this).text());
// })
// test("hello")
// $("*").html("test");
console.log(server_url);

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {  
	if(request.template) {
		// sendResponse({content: "response message"});
        // return true; // This is required by a Chrome Extension
        console.log(request.template);
	}
})