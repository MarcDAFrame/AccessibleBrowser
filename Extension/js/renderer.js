function _html_input(values=[], kwargs={}) {
    type = kwargs.type
    html = "<input "
    for (kwarg in kwargs) {
        html += kwarg + "=\"" + kwargs[kwarg] + "\" "
    }
    html += "></input>"
    return html
}
function _html_img(input = [], kwargs={}) {
    src = kwargs.src
    return "<img src=\"" + src + "\"></img>"
}
function _html_text(values=[], kwargs={}){
    text = values[0]
    return "<p>" + text + "</p>"
}
// item_html = {
//     "input:text" : "<input type=text></input>",
//     "img" : ""
// }
html_type = {
    "img": _html_img,
    "input": _html_input,
    "text" : _html_text,
}

function _get_html_function(type) {
    html_function = html_type[type]
    if (!html_function){
        return 
    }else{
        return html_function
    }
}

function _get_value_from_page(selector, attr, index=0) {
    sel_raw = $(selector)
    sel = sel_raw.eq(index)
    if (attr = "text") {
        return sel.text()
    } else if (attr = "src") {
        return sel.src()
    } else if (attr = "href") {
        return sel.href()
    }else{
        return sel.attr(attr)
    }
}

function _add_html_from_kwargs(object, index=0) {
    /**
     * @params {object} {"name" : ""} 
     * 
     */

    out_kwargs = {};
    out_values = []
    kwargs = object.html.kwargs
    values = object.html.values
    for (i in kwargs) {
        if (kwargs[i].type == 'value') {
            out_kwargs[i] = kwargs[i].value
        } else if (kwargs[i].type == 'worktab') {
            out_kwargs[i] = _get_value_from_page(kwargs[i].value.selector, kwargs[i].value.attr)
        }
    }
    for(i in values){
        console.log(values[i])
        if(values[i].type == 'value'){
            out_values.push(
                values[i].value
            )
        }else if(values[i].type == 'worktab'){
            out_values.push(
                _get_value_from_page(values[i].value.selector, values[i].value.attr, index=index)
            )
        }
    }

    type = object.html.type
    html_function = _get_html_function(type)
    html = html_function(values=out_values, kwargs=out_kwargs)
    return html

}

function _add_html_from_generator(object, index=0){
    /**
     * @param {object} object - {"col" 0, "row" : 0, "html" : {}}
     */
    out_kwargs = {}
    out_values = []
    kwargs = object.html.kwargs
    values = object.html.values
    for(i in kwargs){
        if(kwargs[i].type == 'value'){
            out_kwargs[i] = kwargs[i].value
        }else if(kwargs[i].type == 'worktab'){
            out_kwargs[i] = _get_value_from_page(kwargs[i].value.selector, kwargs[i].value.attr, index=object.index)
        }
    }
    for(i in values){
        if(values[i].type == 'value'){
            out_values.push(
                values[i].value
            )
        }else if(values[i].type == 'worktab'){
            // console.log(object.index)
            out_values.push(
                _get_value_from_page(values[i].value.selector, values[i].value.attr, index=index)
            )
        }
    }
    type = object.html.type
    // console.log(type)
    html_function = _get_html_function(type)
    // console.log(html_function)
    html = html_function(values=out_values, kwargs=out_kwargs)
    return html

}

function render_grid(grid, selected, width = 3, height = 3) {
    /** 
     * grid : {"html" : "<input></input>", "col" : 0, "row" : 0, "span" : 1}
     * selected : int : 0 : index of the first grid to render
     *  
    */
    out_html = "<div class=\"gridwrapper\" id=\"gridwrapper\" style=\"display:grid; grid-template-columns: repeat(" + width + ",1fr); grid-template-rows: repeat(" + height + ", 1fr); height: 100%;\">";
    currow = 0
    curcol = 0
    console.log(grid)
    for (i in grid.slice(selected)) {
        out_html += "<div class=\"griditem\" funcNum=\"" + grid[i   ].funcNum + "\" cellNum = \"" + i + "\" name=\"griditem" + i + "\" id=\"" + grid[i].name + "\" style=\"grid-column: span " + grid[i].span + "; grid-row: span 1 \"><div class=\"griditemcontainer\">"

        out_html += grid[i].html

        out_html += "</div></div>"
    }
    out_html += "</div>"
    return out_html
}
function get_objectId_object(objectId, objects){
    // if(".")
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
                objects_html[objectId] = {"html" : object_html, "object" : object, "funcNum" : objectId, "index" : 0}
            }
            function _add_ngrid(object, objectId){
                // console.log(objectId)
                n = _object_get_ngrid_size(object)
                for(let x = 0; x < n; x++){
                    object_html = _add_html_from_generator(object, index=x);
                    objects_html[objectId+"."+x] = {"html" : object_html, "object" : object, "funcNum" : objectId, "index" : x}
                }
            }
            type = _object_get_type(object)
            if (type == 'grid') {
                _add_grid(object, objectId)
            }else if(type == "ngrid"){
                _add_ngrid(object, objectId)
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
        get_setting("width").then((data)=>{
            width = data;
            get_setting("height").then((data)=>{
                height = data;
                grid = make_grid(objects_html, width = width, height = height)
                // console.log("width");
        
                html = render_grid(grid, 0, width = width, height = height)
                
                html += "<div class=center><div id=#message class=message> test </div></div>"
                res(html);
            })
        })


    })
}