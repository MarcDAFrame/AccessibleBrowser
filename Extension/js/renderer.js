function _html_input(values = [], kwargs = {}) {
    type = kwargs.type
    html = "<input "
    for (kwarg in kwargs) {
        html += kwarg + "=\"" + kwargs[kwarg] + "\" "
    }
    html += "></input>"
    return html
}

function _html_img(input = [], kwargs = {}) {
    src = kwargs.src
    return "<img src=\"" + src + "\"></img>"
}

function _html_text(values = [], kwargs = {}) {
    text = values[0]
    return "<p>" + text + "</p>"
}
function _html_h1(values = [], kwargs = {}){
    text = values[0]
    return "<h1>" + text + "</h1>"
}
// item_html = {
//     "input:text" : "<input type=text></input>",
//     "img" : ""
// }
html_type = {
    "img": _html_img,
    "input": _html_input,
    "text": _html_text,
    "h1" : _html_h1,
}

function _get_html_function(type) {
    html_function = html_type[type]
    if (!html_function) {
        return
    } else {
        return html_function
    }
}

function _get_value_from_page(selector, attr, index = 0) {
    sel_raw = $(selector)
    sel = sel_raw.eq(index)
    if (attr = "text") {
        return sel.text()
    } else if (attr = "src") {
        return sel.src()
    } else if (attr = "href") {
        return sel.href()
    } else {
        return sel.attr(attr)
    }
}

function _add_html_from_kwargs(object, index = 0) {
    /**
     * @params {object} {"name" : ""} 
     * 
     */


    html = []
    for(h in object.html){
        out_kwargs = {}
        out_values = []
        kwargs = object.html[h].kwargs
        values = object.html[h].values

        for (i in kwargs) {
            if (kwargs[i].type == 'value') {
                out_kwargs[i] = kwargs[i].value
            } else if (kwargs[i].type == 'worktab') {
                out_kwargs[i] = _get_value_from_page(kwargs[i].value.selector, kwargs[i].value.attr)
            }
        }
        for (i in values) {
            console.log(values[i])
            if (values[i].type == 'value') {
                out_values.push(
                    values[i].value
                )
            } else if (values[i].type == 'worktab') {
                out_values.push(
                    _get_value_from_page(values[i].value.selector, values[i].value.attr, index = index)
                )
            }
        }
    
        type = object.html[h].type
        html_function = _get_html_function(type)
        // console.log(html_function)
        // console.log(type)
        html.push(html_function(values = out_values, kwargs = out_kwargs))
    }
    
    return html

}

function _add_html_from_ngrid(object, index = 0) {
    /**
     * @param {object} object - {"col" 0, "row" : 0, "html" : {}}
     */

    html = []
    for(h in object.html){
        out_kwargs = {}
        out_values = []
        obj_html = object.html[h]
        kwargs = obj_html.kwargs
        values = obj_html.values
        
        for (i in kwargs) {
            if (kwargs[i].type == 'value') {
                out_kwargs[i] = kwargs[i].value
            } else if (kwargs[i].type == 'worktab') {
                out_kwargs[i] = _get_value_from_page(kwargs[i].value.selector, kwargs[i].value.attr, index = object.index)
            }
        }
        for (i in values) {
            if (values[i].type == 'value') {
                out_values.push(
                    values[i].value
                )
            } else if (values[i].type == 'worktab') {
                // console.log(object.index)
                out_values.push(
                    _get_value_from_page(values[i].value.selector, values[i].value.attr, index = index)
                )
            }
        }
        type = obj_html.type
        html_function = _get_html_function(type)
        // console.log(html_function)
        // console.log(type)
        html.push(html_function(values = out_values, kwargs = out_kwargs))
    }
    return html

}

function _add_html_from_selector(selection, object, index=0){
    htmls = []
    selectors = object.selectors
    for(s in selectors){
        selector = selectors[s]
        values = selector.values
        // console.log(selector)
        type = selector.type
        // value = selector.value
        html = []
        html_function = _get_html_function(type)
        // console.log(html_function)
        // console.log(type)
        // console.log(values)
        for(i in values){
            value = values[i]
            // console.log(value)
            value_selector = value.value.selector
            if(value.type == "worktab"){
                out_values = []
                out_kwargs = {}        
                // console.log(value_selector)
                // console.log(selection.find(value_selector))
                // console.log(selection)
                
                // console.log(selection.find("p"))
                console.log(value_selector)
                selection.find(value_selector).each(function(){
                    // console.log($(this).text())
                    $(this).css("background-color", "red")
                    
                    attr = value.value.attr
                    parent = value.value.parent
                    val = get_values_from_selection_and_attr($(this), attr, parent=parent)
                    // console.log(attr) 
                    // console.log(val)
                    out_values.push(
                        val
                    )
                    // out_values.push(
                    //     val
                    // )

    
                })
                html.push(
                    html_function(values = out_values, kwargs = out_kwargs)
                )
            }

        }
        htmls.push(
            html
        )

    }
    console.log(htmls)
    return htmls
}

function render_grid(grid, selected, width = 3, height = 3) {
    /** 
     * @param {object} grid - 
     *      {
     *      groupindex : {int} default 0, index within group (generator group)
     *      funcnum : {int} incrememnts for everything but not for generators
     *      cellnum : the cell index for all cells
     *      html : {str} string representation of cells inner html
     *      col
     *      row
     *      } 
     *  
     */
    out_html = "<div class=\"gridwrapper\" id=\"gridwrapper\" style=\"display:grid; grid-template-columns: repeat(" + width + ",1fr); grid-template-rows: repeat(" + height + ", 1fr); height: 100%;\">";
    currow = 0
    curcol = 0
    console.log(grid)
    for (i in grid.slice(selected)) {
        out_html += "<div class=\"griditem\" funcNum=\"" + grid[i].funcNum + "\" groupindex=\"" + grid[i].groupindex + "\" cellnum = \"" + i + "\" name=\"griditem" + i + "\" id=\"" + grid[i].name + "\" style=\"grid-column: span " + grid[i].span + "; grid-row: span 1 \"><div class=\"griditemcontainer\">"
        for (h in grid[i].html) {
            out_html += grid[i].html[h]
        }
        out_html += "</div></div>"
    }
    out_html += "</div>"
    return out_html
}

function make_grid(objects_html, width = 3, height = 3) {
    /**
     * @param {object} objects_html - {"html" : str, "object" : {...}}
     */
    //get grid size preset
    grid = []
    currow = 0
    curcol = 0
    curspan = 1
    // console.log(objects_html)
    prev = objects_html[Object.keys(objects_html)[0]]
    console.log(objects_html)
    for (objectId in objects_html) {
        gridobj = {}

        html = objects_html[objectId].html

        object = objects_html[objectId].object

        name = _object_get_name(object)
        col = _object_get_col(object)
        row = _object_get_row(object)

        if (curcol == width) {
            curcol = 0
            curspan = width - curspan + 1
            currow++
        } else {
            if (curcol > col) {
                curcol = 0
            } else {
                curcol++
                curspan++
            }
        }
        gridobj['name'] = name
        gridobj['html'] = html
        gridobj['col'] = col
        gridobj['row'] = row
        gridobj['curspan'] = curspan
        gridobj["groupindex"] = objects_html[objectId].groupindex
        gridobj['funcNum'] = objects_html[objectId].funcNum
        prev = objects_html[objectId]
        grid.push(gridobj)
    }
    return grid
}

function render(config) {
    /**
     * @param {object} config - {"urls_regex" : ["google.com"], "objects" : [{}...], }
     */
    return new Promise((res, rej) => {
        objects_html = {}

        function _add_object(object, objectId) {
            /**
             * 
             * @param {object} object - {"name" : "", "html" : {}, "clicked" : [{}...]} 
             * @param {int} objectId - integer for object
             */
            function _add_grid(object, objectId) {
                // console.log("add_grid")
                object_html = _add_html_from_kwargs(object)
                objects_html[objectId] = {
                    "html": object_html,
                    "object": object,
                    "funcNum": objectId,
                    "groupindex": 0
                }
            }

            function _add_ngrid(object, objectId) {
                // console.log(objectId)
                n = _object_get_ngrid_size(object)
                for (let x = 0; x < n; x++) {
                    object_html = _add_html_from_ngrid(object, index = x);
                    objects_html[objectId + "." + x] = {
                        "html": object_html,
                        "object": object,
                        "funcNum": objectId,
                        "groupindex": x
                    }
                }
            }
            function _add_generator(object, objectId){
                gridconfig = _object_get_gridconfig(object)
                start_selector = gridconfig.between.start
                end_selector = gridconfig.between.end
                include_end = gridconfig.between.include_end
                if (!include_end==true){
                    incude_end = false
                } 

                // console.log(selection.text())
                
                $(start_selector + ", " + end_selector).map(function(){
                    sel = $(this).nextUntil(end_selector)
                    if(include_end){
                        sel = sel.addBack()
                    }
                    console.log(sel.text())
                    htmls = _add_html_from_selector(sel, object)
                    for(h in htmls){
                        html = htmls[h]
                        objects_html[objectId + "." + h] = {
                            "html": object_html,
                            "object": object,
                            "funcNum": objectId,
                            "groupindex": h
                        }
                    }
                })                

            }

            type = _object_get_type(object)
            if (type == 'grid') {
                _add_grid(object, objectId)
            } else if (type == "ngrid") {
                _add_ngrid(object, objectId)
            } else if (type == "generator"){
                _add_generator(object, objectId)
            }
        }
        html = "";
        // console.log(config)
        objects = config.objects
        for (objectId in objects) {
            if (objectId != undefined) {
                _add_object(objects[objectId], objectId)
            }
        }
        // width = await get_setting("width")
        // height = await get_setting("height")
        // console.log("width: " + width)
        get_setting("width").then((data) => {
            width = data;
            get_setting("height").then((data) => {
                height = data;
                grid = make_grid(objects_html, width = width, height = height)
                // console.log("width");

                html = render_grid(grid, 0, width = width, height = height)

                html += "</div>" //<div class=center><div id=#message class=message> test </div>
                res(html);
            })
        })


    })
}