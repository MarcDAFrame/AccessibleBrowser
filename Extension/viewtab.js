console.log("viewtab")
function gotClick(){
    console.log("clicked")
}

function add_userinput(){
    get_setting("userinput").then(userinput_settings => {
        click_events = []
        hover_events = {}
        userinput_settings = userinput_settings.userinput

        for(i in userinput_settings.click_events){
            ce = userinput_settings.click_events[i]
            func = get_input_function(ce.config.func)
            click_events.push({
                "func" : func, "config" : ce.config.funcconfig
            })
            // click_events.push(function(){func(ce.funcconfig)});
        }

        for (i in userinput_settings.hover_events){
            he = userinput_settings.hover_events[i]
            if (!hover_events[he.config["hoverselector"]]){
                hover_events[he.config["hoverselector"]] = []
            }

            func_on = get_input_function(he.config.func_on)
            func_off = get_input_function(he.config.func_off)

            hover_events[he.config["hoverselector"]].push(
                {"func_on" : func_on, "func_off" : func_off}
            )
        }
        console.log(click_events);
        console.log(hover_events)        
        //hover events
        for(key in hover_events){
            $(key).hover(
                function(){
                    for(i in hover_events[key]){
                        hover_events[key][i].func_on($(this))
                    }  
                },
                function(){
                    for(i in hover_events[key]){
                        hover_events[key][i].func_off($(this))
                    }  
                }                
            )
        }
        
        //click events
        $(document).off("keyup").keyup(function (e){//little bit of a hack
            for(i in click_events){
                ce = click_events[i]
                ce.func(e, ce.config)
            }
        })
    })
}

function gotMessage(data, sender, sendReponse){
    console.log(data)
    if(data != undefined){
        if(data.from == "background"){
            html = data.html
            $("*").html(html)
        }
    }
    add_userinput();

    
}
chrome.runtime.onMessage.addListener(gotMessage);
