function _html_input(kwargs){
    type = kwargs.type
    html = "<input"
    for(kwarg in kwargs){
        console.log(kwarg)
        html += kwarg + "=" + kwargs[kwarg] + " "
    }
    html += "</input>"
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
function make_grid(objects_html, template, width=1, height=1){
//get grid size preset

}
function render(template){
    objects_html = {}
    function _add_object(object, objectId){
        function _add_grid(object){
            console.log("add_grid")
            object_html = _add_html_from_kwargs(object)
            objects_html[objectId] = object_html
        }
        if(object.type == 'grid'){
            _add_grid(object)
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

    return html
}