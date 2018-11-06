console.log("worktab");

function prepare_page(template) {
    //turn off js
    //redirect page
}

function change_url() {

}

function do_worktab_func(func, args, kwargs) {
    /**
     * This was built to be expandable as functionality is added
     * 
     * @param {string} func - string representation of function to use
     * 
     * @param {list} args - list of arguments
     * 
     * @param {object} kwargs - key word arguments to be passed to the function
     */
    if (func == "change_url") {
        change_url(args, kwargs)
    }
}
// console.log($(".card-p").text())

function gotMessage(data, sender, sendResponse) {
    /**
     * listener for when worktab gets a message
     * 
     * @param {object} data -
     *      data should always have an attribute from which notes how worktab should utilize the message
     * @param {object} sender - id of the sender
     * 
     * @param {function} sendResponse - send a value back, generally used for error catching can't be async
     *    
     */
    template = data.template
    if (data.from == "background") {
        if (data && template && template.matched) {
            $(document).ready(function () {
                render(template.config).then((html) => {

                    chrome.extension.sendMessage({
                        from: "worktab",
                        html: html,
                        template: template
                    }, function (background_response) {

                    })
                })

            })
        }
    } else if (data.from == "forwardfromworktab") {
        if (data.type == "getValue") {
            sendResponse(get_values_from_selector_and_attr(data.selector, data.attr))
        } else if (data.type == "worktabfunc") {
            do_worktab_func(data.func, data.args, data.kwargs)
        }
    }else if(data.from == "valuefromworktab"){
        selector = data.valueconfig.selector
        attr = data.valueconfig.attr
        index = data.valueconfig.index

        get_values_from_selector_and_attr(selector, attr, index=index)
        
    }

}
chrome.runtime.onMessage.addListener(gotMessage);