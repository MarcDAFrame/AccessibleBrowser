function init() {
    /**
     * runs on extension start
     * 
     */
    return new Promise((res, rej) => {
        /**
         * creates worktab and viewtab
         * 
         * @returns {object} - worktab and viewtab as an object
         */
        chrome.tabs.create({
            pinned: true,
            url: "https://www.mframe.ca/worktab"
        }, function (worktab) {

            chrome.tabs.create({
                pinned: true,
                url: "https://www.mframe.ca/viewtab"
            }, function (viewtab) {

                /*@function sets view tab as the active one*/

                chrome.tabs.update(viewtab.id, {
                    active: true
                });
                chrome.tabs.onUpdated.addListener(function (tabId, info) {
                    /**
                     * waits till the tabs have completed to return the values
                     */
                    if (info.status === 'complete' && tabId == viewtab.id) {
                        res({
                            worktab: worktab,
                            viewtab: viewtab
                        });
                    }
                });
            })
        });
    })

}
init().then((ret) => {
    worktab = ret.worktab
    viewtab = ret.viewtab

    function worktab_change_url(url) {
        chrome.tabs.update(worktab, {
            url: url
        })
    }
    worktabfuncs = {
        "worktab_change_url": worktab_change_url
    }
    worktab_change_listener = function (tabId, info, tab) {
        if (info.url && tabId == worktab.id) {
            console.log("URL CHANGE =>" + info.url);
            user_token = "marcssecrettoken______________"
            get_template(info.url, user_token).then(data => {
                chrome.tabs.sendMessage(worktab.id, {
                    from: "background",
                    template: data
                }, function (worktab_response) {

                });
            });

        }
    }
    chrome.tabs.onUpdated.addListener(worktab_change_listener);

});

function change_url(args) {
    /**
     * changes the url
     * 
     * @param {list} args 
     *      - args[0] is the url
     */
    url = args[0]
    chrome.tabs.update(worktab.id, {
        url: url
    })
}

function do_background_func(func, args, kwargs) {
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
    if (data.from == "worktab") {
        html = data.html
        template = data.template
        chrome.tabs.sendMessage(viewtab.id, {
            from: "background",
            html: html,
            worktabhtml : data.worktabhtml,
            template: template
        }, function (viewtab_response) {

        })
    } else if (data.from == "forwardtoworktab") {
        chrome.tabs.sendMessage(worktab.id, data, function (worktab_response) {

        })
    } else if (data.from == "backgrounddowork") {
        do_background_func(data.func, data.args, data.kwargs);
    }
}
chrome.runtime.onMessage.addListener(gotMessage);

function install() {
    /**
     * initializes the app
     *      -control settings
     */
    console.log("project settings installed")
    set_setting("userinput", {
        "mouseclick_events": [{
            "type": "mouseclick",
            "config": {
                "func": "mouseclick_selected",
                "funcconfig": {}
            }
        }],
        
        "click_events": [
            {"type" : "keyboard", "config" : {"func" : "select_next", "funcconfig" : {"key" : "ArrowRight"}}},
            {"type" : "keyboard", "config" : {"func" : "select_prev", "funcconfig" : {"key" : "ArrowLeft"}}},
            {"type" : "keyboard", "config" : {"func" : "click_selected", "funcconfig" : {"key" : "z"}}}
        ],
        "hover_events": [
            {
            "type": "mouse",
            "config": {
                "hoverselector": ".griditem",
                "func_on": "hover_selector_on",
                "func_off": "hover_selector_off"
            }
        }
    ]
        // "selector" :
    })
    set_setting("width", 3)
    set_setting("height", 3)
} //phil was here  8======3  ~~~~~~~~ ( o Y o )

chrome.runtime.onInstalled.addListener(install);