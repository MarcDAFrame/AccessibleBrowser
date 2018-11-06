console.log("viewtab")
function gotClick(){
    console.log("clicked")
}


function add_userinput(template){
    _get_value_from_worktab({"selector" : ".card-p", "attr" : "text"}, function(value){
        console.log(value)
    })   
    create_funcs(template).then((funcs) => {
        clicked_funcs = funcs.clicked_funcs
        hovered_funcs = funcs.hovered_funcs
        // console.log(clicked_funcs);
        // console.log(hovered_funcs);
        click_events = []
        hover_events = {}
        console.log(clicked_funcs)
        function run_clicked_function(funcNum){
            console.log(funcNum);
            func = clicked_funcs[funcNum]
            console.log(func)
            // console.log(clicked_funcs)
            // console.log(func);
            if(func){
                func()
            }
        }
        function run_hovered_on_function(funcNum){
            func = hovered_funcs[funcNum]
            if(func){
                func()
            }
        }
        function run_hovered_off_function(funcNum){
            func = hovered_funcs[funcNum]
            if(func){
                func()
            }
        }
        input_functions = {
            "hover_selector_on" : [hover_selector_on, {func: run_hovered_on_function}],
            "hover_selector_off" : [hover_selector_off, {func: run_hovered_off_function}],
            "click_selected" : [click_selected, {func : run_clicked_function}],
            "select_prev" : [select_prev, {}],
            "select_next" : [select_next, {}]
        }
        function get_input_function(str){
            /**
             * gets function from string representaiton of function
             * 
             * @param {string} str - String representation of function to be keyed from the input_funcitons dictionary 
             */
            return input_functions[str];
        }
        get_setting("userinput").then(userinput_settings => {
            /**
             * click events
             */
            for(i in userinput_settings.click_events){
                ce = userinput_settings.click_events[i]
                /* get input function from selector.js */
                func = get_input_function(ce.config.func)[0]
                funcconfig = get_input_function(ce.config.func)[1]
                config = Object.assign(funcconfig, ce.config.funcconfig)
                click_events.push({
                    "func" : func, "config" : config
                })
                // click_events.push(function(){func(ce.funcconfig)});
            }

            /**
             * hover events
             */
            for (i in userinput_settings.hover_events){
                he = userinput_settings.hover_events[i]

                if (!hover_events[he.config["hoverselector"]]){
                    hover_events[he.config["hoverselector"]] = []
                }
    
                func_on = get_input_function(he.config.func_on)[0]
                func_on_config = get_input_function(he.config.func_on)[1]
                func_off = get_input_function(he.config.func_off)[0]
                func_off_config = get_input_function(he.config.func_off)[1]

    
                hover_events[he.config["hoverselector"]].push(
                    {"func_on" : [func_on, func_on_config], "func_off" : [func_off, func_off_config]}
                )
            }
            // console.log(click_events)
            // console.log(hover_events)        
            //hover events

            /**
             * iterates through all possible selectors to add a hover event to
             */
            for(key in hover_events){
                $(key).hover(
                    function(){
                        for(i in hover_events[key]){
                            he = hover_events[key][i]
                            he.func_on[0]($(this), he.func_on[1])
                        }  
                    },
                    function(){
                        for(i in hover_events[key]){
                            he = hover_events[key][i]
                            he.func_off[0]($(this), he.func_off[1])
                        }  
                    }                
                )
            }
            //click events
            /**
             * adds all click events to keyup
             * 
             * little bit of a hack because it removes keyup then puts it back on
             */
            $(document).off("keyup").keyup(function (e){//little bit of a hack
                console.log(e.key)
                for(i in click_events){
                    ce = click_events[i]
                    ce.func(e, ce.config)
                }
            })
        })
    })

}

function gotMessage(data, sender, sendReponse){
    // console.log(data)
    if(data != undefined){
        if(data.from == "background"){
            html = data.html
            template = data.template
            console.log("Matched: " + template.matched + " : " + template.config.urls_regex)
            $("*").html(html)
            add_userinput(template);

        }
    }

    
}
chrome.runtime.onMessage.addListener(gotMessage);
