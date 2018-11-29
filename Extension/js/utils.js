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

function between_tags(first, last, include_self=true, include_end=true){
    selections = []
    first_sel = $(first)
    last_sel = $(last)
    last_index = 0
    first_sel.each(function(index){
        iter = $(this)
        // console.log(last_index)
        last_sel.slice(last_index).each(function(index2){
            if($(iter).is($(this))){
                return true;
            }
            // console.log(iter)
            // console.log($(this))
            // console.log(include_self)
            sel = $(iter).nextUntil($(this))
            if(include_self){
                sel = sel.addBack()
            }
            selections.push(
                sel
            )

            return false;
        })
        last_index += 1
    })
    if(include_end){
        sel = last_sel.last().nextAll()
        if(include_self){
            sel = sel.addBack()
        }
        selections.push(
            sel
        )
    }
    return selections
}