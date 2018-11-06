function get_values_from_selector_and_attr(selector, attr, index=null){
    var val = null
    sel = $(selector)
    if(index){
        sel = sel.eq(index)
    }else{
        sel = sel.first()
    }
    if (attr == "val"){
        val = $(selector).val()
    }
    else{
        val = $(selector).attr(attr)
    } 
    return val
}