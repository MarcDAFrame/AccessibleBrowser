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

function get_selected_cell_pos() {
    funcNum = parseInt($(".selected").first().attr("cellpos"));
    return funcNum;
}

function get_selected_cell_num() {
    cellnum = parseInt($(".selected").first().attr("cellnum"));
    return cellnum;
}

function get_selected_cell_groupindex() {
    groupindex = parseInt($(".selected").first().attr("groupindex"));
    return groupindex;
}

//FUNCTIONS
function create_function_details() {
    details = {
        "funcnum": get_selected_cell_funcnum(),
        "cellnum": get_selected_cell_num(),
        "groupindex": get_selected_cell_groupindex(),
    }
    return details
}

function click_selected(e, kwargs) {
    // console.log(config.key)
    func = kwargs.func
    if (e.key == kwargs.key) {
        // console.log(e);
        // console.log(func)
        details = create_function_details()
        func(details)
    }
}

function hover_selector_on(item, kwargs) {
    item.addClass("selected")
    func = kwargs.func
    details = create_function_details()
    func(details)
}

function hover_selector_off(item, kwargs) {
    item.removeClass("selected")
    func = kwargs.func
    details = create_function_details()
    func(details)
}



//SELECTIONS
function new_selection(newSelected) {
    /**
     * 
     */
    // console.log(newSelected)
    current = $(".selected")
    // console.log(current)
    // if (!current.is(newSelected)) {
    current.removeClass("selected");
    newSelected.addClass("selected")
    // }

}
current_page_start = 0
// current_cell_page = 0

function check_do_page_change(cellnum, magnitude, data_package) {
    // pages = get_pages()
    pages = data_package.pages
    grid = data_package.grid
    // console.log(pages)
    pos = get_selected_cell_pos()
    new_index = pos + magnitude
    if (new_index < 0) {
        new_index = pages.length - 1
    }
    width = data_package.width
    height = data_package.height
    // console.log(cellnum)
    // console.log(magnitude)
    n = get_number_of_grids_per_page(grid, width, height)
    current_cell_page = get_selected_cell_pos()
    console.log(current_cell_page)
    // if(current_cell_page >= 0 || current_cell_page < n){
    //     current_cell_page += magnitude
    // }
    if ((cellnum + magnitude < 0 || cellnum + magnitude > n)) {
        current_page_start += magnitude
        html = render_grid(grid, width = width, height = height, start = current_page_start)
        change_viewtab_html(html)
        if (magnitude < 0) {
            // console.log("HELLO")
            new_selection($("[cellpos=0]"))
            // current_cell_page = n-1
        } else {
            // console.log("HELLO1")
            // console.log(n - 1)
            // console.log("[cellpos=" + (n - 1) + "]")
            new_selection($("[cellpos=" + (n - 1) + "]"))
            // current_cell_page=0
        }
        return true
    }

    return false
    // if(){
    //     current_cell_page += magnitude
    //     html = render_grid(grid, width=width, height=height, start=current_cell_page)
    //     change_viewtab_html(html)
    // }
}

function select_next_cellnum(cellnum, data_package) {
    /**
     * checks to see if the number of cells over flows or goes to a new page
     */
    // console.log(cellnum);
    nextcellnum = cellnum + 1
    n = get_number_of_grids_per_page(data_package.grid, data_package.width, data_package.height)
    // console.log(nextcellnum + ", " + n)
    if (nextcellnum > n || nextcellnum < 0) {
        // console.log("test")
        return
    }
    if(!check_do_page_change(nextcellnum, 1, data_package)){
        new_selection($("[cellpos=" + nextcellnum + "]"))
    }

}

function select_prev_cellnum(cellnum, data_package) {
    /**
     * checks to see if the number of cells over flows or goes to a new page
     */
    // console.log(cellnum);
    nextcellnum = cellnum - 1
    n = get_number_of_grids_per_page(data_package.grid, data_package.width, data_package.height)
    // console.log(nextcellnum + ", " + n)
    if (nextcellnum > n) {
        // console.log("test")
        return
    }
    if(!check_do_page_change(nextcellnum, -1, data_package)){
        new_selection($("[cellpos=" + nextcellnum + "]"))
    }

}

function select_next(e, kwargs) {
    if (e.key == kwargs.key) {
        // console.log("next");
        cellnum = get_selected_cell_pos()
        // console.log(cellnum)
        if (!cellnum) {
            cellnum = 0;
        }
        select_next_cellnum(cellnum, kwargs.data_package)
    }
}

function select_prev(e, kwargs) {
    if (e.key == kwargs.key) {
        // console.log("prev");
        cellnum = get_selected_cell_pos()
        if (!cellnum) {
            cellnum = 0;
        }
        select_prev_cellnum(cellnum, kwargs.data_package)
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