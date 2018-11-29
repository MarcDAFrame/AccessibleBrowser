console.log("viewtab")
function gotClick(){
    console.log("clicked")
}


function add_userinput(template, data_package){

    create_funcs(template, data_package).then((funcs) => {
        clicked_funcs = funcs.clicked_funcs
        hovered_funcs = funcs.hovered_funcs
        // console.log(clicked_funcs);
        // console.log(hovered_funcs);
        click_events = []
        hover_events = {}
        console.log(clicked_funcs)
        function run_clicked_function(details){
            funcNum = details.funcNum;
            console.log(funcnum);
            func = clicked_funcs[funcnum]
            console.log(func)
            // console.log(clicked_funcs)
            // console.log(func);
            if(func){
                func(details)
            }
        }
        function run_hovered_on_function(details){
            funcnum = details.funcnum;
            func = hovered_funcs[funcnum]
            if(func){
                func(details)
            }
        }
        function run_hovered_off_function(details){
            funcnum = details.funcnum;
            func = hovered_funcs[funcnum]
            if(func){
                func(details)
            }
        }
        input_functions = {
            "hover_selector_on" : [hover_selector_on, {func: run_hovered_on_function}],
            "hover_selector_off" : [hover_selector_off, {func: run_hovered_off_function}],
            "click_selected" : [click_selected, {func : run_clicked_function}],
            "select_prev" : [select_prev, {"data_package" : data_package}],
            "select_next" : [select_next, {"data_package" : data_package}]
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
width = 0
height = 0
function init_viewtab(){
    $("*").html(`
    <div id="viewtab"></div>
    <div id=\"worktabhtml\" style=\"display:hidden\"></div>
    `)
}
init_viewtab()
function change_viewtab_html(html){
    // console.log(html)
    $("div#viewtab").html(html)
    console.log(html)
    console.log("CHANGED HTML")
}
function change_worktabhtml_html(html){
    $("div#worktabhtml").html(html)
}
function gotMessage(data, sender, sendReponse){
    // console.log(data)
    if(data != undefined){
        if(data.from == "background"){
            console.log(data)
            html = data.render_data.html
            grid = data.render_data.grid
            pages = data.render_data.pages
            // pages.concat(data.render_data.pages)
            console.log(pages)
            console.log(grid)
            get_setting("width").then(function(w){
                get_setting("height").then(function(h){
                    height = h
                    width = w
                    console.log("RENDER GRID 1")
                    page1 = render_grid(pages[0], width=width, height=height, start=0)
                    // console.log(page1)
                    data_package = {
                        "pages" : pages,
                        "grid" : grid,
                        "width" : width,
                        "height" : height,
                    }
                    worktabhtml = data.worktabhtml
                    template = data.template
                    console.log("Matched: " + template.matched + " : " + template.config.urls_regex)
                    // $("*").html(page1)
                    change_viewtab_html(page1)
                    // console.log(data)
                    change_worktabhtml_html(worktabhtml)
                    // $("html").append("<div id=\"worktabhtml\" style=\"display:hidden\">" + worktabhtml + "</div>")
                    add_userinput(template, data_package);        
                })
            })


        }
    }

    
}
chrome.runtime.onMessage.addListener(gotMessage);
