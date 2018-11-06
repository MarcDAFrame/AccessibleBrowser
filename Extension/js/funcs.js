function _normalize_url(url) {
    //TODO
    return url;
}

function get_value_from_viewtab(selector, attr) {
    return get_values_from_selector_and_attr(selector, attr)
}

function get_from_viewtab(funcconfig) {
    if (funcconfig.type == "cssselector") {
        return get_value_from_viewtab(funcconfig.selector, funcconfig.attr)
    }

    return func
}

function get_value_from_worktab(selector, attr) {
    chrome.runtime.sendMessage({
        "from": "forwardtoworktab",
        "type": "getValue",
        "selector": selector,
        "attr": attr
    }, function (response) {
        console.log(response);
        return response
    })
}

function get_from_worktab(funcconfig) {
    if (funcconfig.type == "cssselector") {
        get_value_from_worktab(parameter.value.selector, parameter.value.attr);
    }
}

function create_restful_url(funcconfig) {
    func = function () {
        var query = funcconfig.url + "?";
        var include_ampresand = false;
        var val = null;
        for (key in funcconfig.parameters) {
            parameter = funcconfig.parameters[key]
            if (include_ampresand) {
                query += "&"
            }
            include_ampresand = true;
            if (parameter.type == "viewtab") {
                val = get_from_viewtab(parameter.value)
            } else if (config.type == "worktab") {
                val = get_from_worktab(parameter.value)
            } else if (config.type == "value") {
                return config.value
            }
            query += key + "=" + val
        }
        return query
    }
    return func
}

function worktab_do_work(func, args = null, kwargs = null) {
    chrome.runtime.sendMessage({
        "from": "forwardtoworktab",
        "type": "worktabfunc",
        "func": func,
        "args": args,
        "kwargs": kwargs
    }, function (response) {

    })
}

function background_do_work(func, args = null, kwargs = null) {
    chrome.runtime.sendMessage({
        "from": "backgrounddowork",
        "type": "backgroundfunc",
        "func": func,
        "args": args,
        "kwargs": kwargs
    }, function (response) {

    })
}

function _get_value_from_worktab(valueconfig, callback){
    chrome.runtime.sendMessage({
        "from": "valuefromworktab",
        "type": "getValue",
        "valueconfig": valueconfig,
    }, function (response) {
        // console.log(response);
        // return response
        callback(response)
    })
}

function get_value_from_config(config){
    return new Promise((res, rej)=>{
        
        if(config.type == "value"){
            res()
        }else if(config.type == "worktab"){
            _get_value_from_worktab(config.value, (value)=>{
                res(value)
            })

        }
    })
}

function create_funcs(template) {
    /**
     * template : is the website config file json
     * worktabfuncs is the 
     * 
     * @returns {object}
     *      {
     *          clicked_funcs : {
     *              
     *          }
     *      }
     */
    return new Promise((res, rej) => {
        function form_func(config) {
            if (config.type == "restful") {
                func = function () {
                    var url = create_restful_url(config)()
                    // worktabfuncs['worktab_change_url'](url)
                    background_do_work("change_url", args = [url])
                    // return url
                }
            }
            return func
        }
        function link_func(config){
            console.log(config);
            if(config.type == 'href'){
                get_value_from_config(config.href).then((url)=>{
                    func = function(){
                        background_do_work("change_url", args=[url])                                
                    }        
                    return func
                })

            }

        }

        function message_func(config) {
            if (config.type == "value") {
                var value = config.value
                func = function () {
                    $("#message").text(value)
                }
            } else if (config.type == "viewtab") {

            }
            return func;
        }

        funcs_dict = {
            "form": [form_func, {}],
            "link" : [link_func, {}],
            "message": [message_func, {}]
        }
        // console.log(template)
        objects = template.config.objects
        clicked_funcs = {}
        hovered_funcs = {}
        for (i in objects) {
            clicked = objects[i].clicked
            hovered = objects[i].hovered
            // console.log(click)
            for (x in clicked) {
                click = clicked[x]
                if (click) {
                    
                    func = funcs_dict[click.type][0]
                    config = funcs_dict[click.type][1]

                    if (click.funcconfig) {
                        config = Object.assign(config, click.funcconfig)
                    }
                    clicked_funcs[i] = func(config)
                }
            }
            for(x in hovered){
                hover = hovered[x]
                if (hover) {
                    
                    func = funcs_dict[hover.type][0]
                    config = funcs_dict[hover.type][1]

                    if (hover.funcconfig) {
                        config = Object.assign(config, hover.funcconfig)
                    }
                    hovered_funcs[i] = func(config)
                }
            }
        }
        funcs = {
            clicked_funcs: clicked_funcs,
            hovered_funcs: hovered_funcs
        }
        // console.log(funcs);
        res(funcs);
        // res(clicked_funcs, hovered_funcs)
    })

}