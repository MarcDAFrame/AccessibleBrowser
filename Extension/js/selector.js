function timed_selector(config) {
    /**
     * 
     */
    time = config.time
    if (!time) {
        time = 1
    }

    select_if_not_selected()

    console.log("SELECTOR")
    prev = $(".griditem").first()
    console.log(prev)
    // prev.addClass("selected")
    $(".griditem").each(item => {
        console.log(item)
        setTimeout(time => {
            prev.removeClass("selected");
            item.addClass("selected");
            prev = item;
        }, time * 1000)
    })
}
function get_selected_cell_funcnum() {
    funcNum = parseInt($(".selected").first().attr("funcNum"));
    return funcNum;
}
function get_selected_cell_num() {
    cellNum = parseInt($(".selected").first().attr("cellNum"));
    return cellNum;
}


//FUNCTIONS
function click_selected(e, kwargs) {
    // console.log(config.key)
    func = kwargs.func
    if (e.key == kwargs.key) {
        // console.log(e);
        // console.log(func)
        func(get_selected_cell_funcnum())
    }
}
function hover_selector_on(item, kwargs) {
    item.addClass("selected")
    func = kwargs.func
    // console.log(func)
    func(get_selected_cell_funcnum())
}

function hover_selector_off(item, kwargs) {
    item.removeClass("selected")
    func = kwargs.func
    // console.log(func)
    func(get_selected_cell_funcnum())
}



//SELECTIONS
function new_selection(newSelected) {
    /**
     * 
     */
    current = $(".selected")
    newSelected.addClass("selected")
    current.removeClass("selected");

}

function select_next_cellNum(cellNum) {
    /**
     * checks to see if the number of cells over flows or goes to a new page
     */
    // console.log(cellNum);
    nextCellNum = cellNum + 1
    new_selection($("[cellNum=" + nextCellNum + "]"))

}

function select_prev_cellNum(cellNum) {
    /**
     * checks to see if the number of cells over flows or goes to a new page
     */
    // console.log(cellNum);
    nextCellNum = cellNum - 1
    new_selection($("[cellNum=" + nextCellNum + "]"))

}

function select_next(e, kwargs) {
    if (e.key == kwargs.key) {
        // console.log("next");
        cellNum = get_selected_cell_num()
        if (!cellNum) {
            cellNum = 0;
        }
        select_next_cellNum(cellNum)
    }
}

function select_prev(e, kwargs) {
    if (e.key == kwargs.key) {
        // console.log("prev");
        cellNum = get_selected_cell_num()
        if (!cellNum) {
            cellNum = 0;
        }
        select_prev_cellNum(cellNum)
    }
}


function select_if_not_selected() {
    if (!$(document).getClass("selected")) {
        $(".griditem").first().addClass("selected")
    }
}

function button_selector(e, config) {
    key = config.key
    select_if_not_selected()

    if (e.key == key) { //z key
        console.log("clicked")
        // console.log(key)
        // console.log(e.key)
        new_selection($(".selected").next())
    }

}


function keyboard_click(e, func, config) {
    key = config.key;
    if (e.key == key) { //z key
        func();
    }
}

function mouse_click(func, config) {

}

function add_clickevent(event, click_type, func, config) {
    if (click_type == "mouse") {
        mouse_click(event, func, config)
    } else if (click_type == "keyboard") {
        keyboard_click(func, config)
    }
}

function add_selector(selector_type, config) {
    if (selector_type == "hover") {
        hover_selector(config);
    } else if (selector_type == "timed") {
        timed_selector(config);
    } else if (selector_type == "button") {
        button_selector(config);
    }
}