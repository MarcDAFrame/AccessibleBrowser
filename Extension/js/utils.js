function get_values_from_selection_and_attr(sel, attr, parent=null, index=null){
    // console.log(parent)
    // console.log(sel.text())
    // console.log(sel)
    // console.log(sel.html());
    // console.log(attr)

    if(index){
        sel = sel.eq(index)
    }else{
        sel = sel.first()
    }
    if (parent != null && parent >= 0){
        console.log(parent)
        sel = sel.parents().eq(parent)
    }
    
    var val = null

    if (attr == "val"){
        val = sel.val()
    }else if(attr=="text"){
        val = sel.text()
    }else{
        val = sel.attr(attr)
        // console.log(val)
    } 
    return val
}
function get_values_from_selector_and_attr(selector, attr, index=null){
    sel = $(selector)
    return get_values_from_selection_and_attr(sel, attr, index=index)
}