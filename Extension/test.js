function get_from_viewtab(funcconfig) {
    if (funcconfig.type == "cssselector") {
        func = function () {
            var val = "THIS IS A TEST VAL"
            // var val = _get_value_from_page(funcconfig.selector, funcconfig.attr)
            return val
        }
    }

    return func
}
function create_restful_url(funcconfig) {
    func = function () {
        var query = funcconfig.url + "?";
        var include_ampresand = false;
        var val = null;
        for (key in funcconfig.parameters) {
            parameter = funcconfig.parameters[key]
            if(include_ampresand){
                query += "&"
            }
            include_ampresand = true;
            if (parameter.type == "viewtab") {
                val = get_from_viewtab(parameter.value)()
            }else if(config.type == "worktab"){
                //
            }else if(config.type == "value"){
                return config.value
            }
            query += key + "=" + val
        }
        return query
    }
    return func
}

function create_funcs(template, worktabfuncs) {
    function form_func(config) {
        if (config.type == "restful") {
            func = function(){
                var url = create_restful_url(config)()
                worktabfuncs['worktab_change_url'](url)
                return url
            }
        }
        return func
    }
    funcs_dict = {
        "form": [form_func, {}]
    }
    objects = template.objects
    funcs = []
    for (i in objects) {
        click = objects[i].clicked
        if (click) {
            func = funcs_dict[click.type][0];
            config = funcs_dict[click.type][1];
            if (click.funcconfig) {
                config = Object.assign(config, click.funcconfig)
            }
            funcs.push(
                func(config) 
            )
        }
    }
    return funcs
}
template = {
    "urls_regex": [
        ".*google.com"
    ],
    "urls_regex_exclude" : [
        
    ],
    "objects": [
        {
            "name": "google_logo",
            "type": "grid",
            "gridtype": "img",
            "html": {
                "type": "img",
                "kwargs": {
                    "src": {
                        "type": "value",
                        "value" : "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                    }
                }
            },
            "col": 0,
            "row": 0,
            "selectable":false
        },
        {
            "name": "search_bar",
            "type": "grid",
            "gridtype": "input",
            "html": {
                "type": "input",
                "kwargs" : {
                    "type" : {"type" : "value", "value" : "text"}
                }
            },
            "col": 0,
            "row": 1,
            "click": {
                "type": "link",
                "value": {
                    "type": "page",
                    "href": "parent.href"
                }
            }
        },
        {
            "name": "search_bar",
            "type": "grid",
            "gridtype": "input",
            "html": {
                "type": "input",
                "kwargs" : {
                    "value" : {"type" : "value", "value" : "Google Search"},
                    "name" : {"type" : "value", "value" : "btnK"},
                    "jsaction" : {"type" : "value", "value" : "sf.chk"},
                    "type" : {"type" : "value", "value" : "submit"},
                    "aria-label" : {"type" : "value", "value" : "Google Search"},
                    "id" : {"type" : "value", "value" : "search_bar_input"}
                }
            },
            "col": 0,
            "row": 2,
            "clicked": {
                "type": "form",
                "funcconfig": {
                    "type" : "restful",
                    "url" : "https://google.com/search",
                    "parameters" : {
                        "q" : {"type" : "viewtab", "value" : {"type" : "cssselector", "selector" : "#search_bar_input", "attr" : "text"}},
                        "test" : {"type" : "value", "value" : "test"}

                    }
                }
            }
        }
    ]
} 
funcs = create_funcs(template, {"worktab_change_url" : function(){console.log("test")}})
console.log(funcs[0]())