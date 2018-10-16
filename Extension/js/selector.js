input_functions = {
    "hover_selector_on" : hover_selector_on,
    "hover_selector_off" : hover_selector_off,
    "click_selected" : click_selected,
}
function get_input_function(str){
    /**
     * gets function from string representaiton of function
     */
    return input_functions[str];
}
function timed_selector(config){
    time = config.time
    if(!time){time = 1}

    select_if_not_selected()

    console.log("SELECTOR")
    prev = $(".griditem").first()
    console.log(prev)
    // prev.addClass("selected")
    $(".griditem").each(item=>{
        console.log(item)
        setTimeout(time=>{
            prev.removeClass("selected");
            item.addClass("selected");
            prev = item;
        }, time*1000)
    })
}
function hover_selector_on(item){
    item.addClass("selected")
}
function hover_selector_off(item){
    item.removeClass("selected")
}
function select_if_not_selected(){
    if (!$(document).getClass("selected")){
        $(".griditem").first().addClass("selected")    
    }
}
function button_selector(e, config){
    key = config.key
    select_if_not_selected()

    if (e.key == key) {//z key
        console.log("clicked")
        // console.log(key)
        // console.log(e.key)
        current = $(".selected")
        current.next().addClass("selected");
        current.removeClass("selected");
    }

}
function click_selected(e, config){
    if(e.key == config.key){
        console.log(e);
    }
}
function keyboard_click(e, func, config){
    key = config.key;
    if (e.key == key) {//z key
        func();
    }

}

function mouse_click(func, config){
    
}

function add_clickevent(event, click_type, func, config){
    if(click_type == "mouse"){
        mouse_click(event, func, config)
    }else if(click_type == "keyboard"){
        keyboard_click(func, config)
    }
}
function add_selector(selector_type, config){
    if(selector_type == "hover"){
        hover_selector(config);
    }else if (selector_type == "timed"){
        timed_selector(config);
    }else if(selector_type == "button"){
        button_selector(config);
    }
}