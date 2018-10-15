function _html_input(kwargs){
    type = kwargs.type
    html = "<input "
    for(kwarg in kwargs){
        console.log(kwarg)
        html += kwarg + "=\"" + kwargs[kwarg] + "\" "
    }
    html += "></input>"
    return html
}
function _html_img(kwargs){
    console.log(kwargs)
    src = kwargs.src
    return "<img src=\"" + src + "\"></img>"
}
// item_html = {
//     "input:text" : "<input type=text></input>",
//     "img" : ""
// }
html_type = {
    "img" : _html_img,
    "input" : _html_input,
}

function _get_html_function(type){
    return html_type[type]
}

function _get_value_from_page(selector, attr){
    if(attr = "text"){
        return $(selector).text()
    }else if(attr = "src"){
        return $(selector).src()
    }else if(attr = "href"){
        return $(selector).href()
    }
}

function _add_html_from_kwargs(object){
    out_kwargs = {};
    kwargs = object.html.kwargs
    for(i in kwargs){
        if(kwargs[i].type == 'value'){
            out_kwargs[i] = kwargs[i].value
        }else if(kwargs[i].type == 'page'){
            out_kwargs[i] = _get_value_from_page(kwargs[i].value.selector, kwargs[i].value.attr)
        }
    }

    type = object.html.type
    html_function = _get_html_function(type)
    html = html_function(out_kwargs)
    console.log(html)
    return html
}
function render_grid(grid, selected, width=3, height=3){
    /** 
     * grid : {"html" : "<input></input>", "col" : 0, "row" : 0, "span" : 1}
     * selected : int : 0 : index of the first grid to render
     *  
    */
    out_html = "<div class=\"gridwrapper\" id=\"gridwrapper\" style=\"display:grid; grid-template-columns: repeat(" + width + ",1fr); grid-template-rows: repeat(" + height + ", 1fr); height: 100%;\">"; 
    currow = 0
    curcol = 0
    for(i in grid.slice(selected)){
        out_html += "<div class=griditem id=griditem" + i + " style=\"grid-column: span " + grid[i].span + "; grid-row: span 1 \">"

            out_html += grid[i].html

        out_html += "</div>"
    }
    out_html += "</div>"

    return out_html
}
function make_grid(objects_html, template, width=3, height=3){
//get grid size preset
    grid = []
    currow = 0
    curcol = 0
    curspan = 1
    prev = objects_html[Object.keys(objects_html)[0]]
    for(objectId in objects_html){
        gridobj = {}

        html = objects_html[objectId]
        col = template.objects[objectId].col
        row = template.objects[objectId].row
        if (curcol == width){
            curcol = 0
            curspan = width-curspan+1
            currow++
        }else{
            if (curcol > col){
                curcol = 0
            }else{
                curcol++
                curspan++
            }
        }
        gridobj['html'] = html
        gridobj['col'] = col
        gridobj['row'] = row
        gridobj['curspan'] = curspan
        prev = objects_html[objectId]
        grid.push(gridobj)
    }
    return grid
}
function render(template, width=3, height=3){
    objects_html = {}
    function _add_object(object, objectId){
        function _add_grid(object, objectId){
            console.log("add_grid")
            object_html = _add_html_from_kwargs(object)
            objects_html[objectId] = object_html
        }
        if(object.type == 'grid'){
            _add_grid(object, objectId)
        }
    }
    html = "";
    console.log(template)
    objects = template.objects
    for (objectId in objects){
        if(objectId != undefined){
            _add_object(objects[objectId], objectId)
        }
    }
    console.log(objects_html)
    grid = make_grid(objects_html, template, width=width, height=height) 
    console.log(grid)
    html = render_grid(grid, 0, width=width, height=height)
    console.log(html)
    return html
}