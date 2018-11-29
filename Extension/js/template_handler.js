function _object_get_ngrid_size(object){
    if(!object){return null}
    return object.gridconfig.n;
}
function _object_get_type(object){
    if(!object){return null}
    return object.type;
}
function _object_get_name(object){
    if(!object){return null}
    return object.name;
}
function _object_get_col(object){
    if(!object){return null}
    return object.col;
}
function _object_get_row(object){
    if(!object){return null}
    return object.row;
}
function _object_get_gridconfig(object){
    if(!object){return null}
    return object.gridconfig
}

function _gridconfig_get_start_selector(gridconfig){
    if(!gridconfig){return null}
    if(gridconfig.between){
        return gridconfig.between.start
    }
    return null;
}
function _gridconfig_get_end_selector(gridconfig){
    if(!gridconfig){return null}
    if(gridconfig.between){
        return gridconfig.between.end
    }
    return null;
}
function _gridconfig_get_include_end(gridconfig){
    if(!gridconfig){return null}
    if (gridconfig.between){
        if(gridconfig.between.include_end == false){
            return false
        }
    }
    return true
}
function _gridconfig_get_include_self(gridconfig){
    if(!gridconfig){return null}
    if (gridconfig.between){
        if(gridconfig.between.include_self == false){
            return false
        }
    }
    return true
}
function _object_get_selectors(object){
    if(!object){return null}
    return object.selectors
}

function _value_get_parent(value){
    if(!value){return null}
    if(value.parent){
        return value.parent
    }
    return null;
}
function _value_get_attr(value){
    if(!value){return null}
    if(value.attr){
        return value.attr
    }
    return null;
}