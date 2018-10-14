function template_handler(template){
    function handler(){
        metadata_defaults = {
            "javascript" : true
        }
        function get_metadata(){
            if (!template){
                return undefined;
            }
            if (template.get_metadata){
                return template.get_metadata
            }
            return undefined;
        }
        function get_from_metadata(kwarg){
            if (template.get_metadata()){
                metadata = template.get_from_metadata()
                var out = metadata_defaults[kwarg]
                if(metadata && metadata[kwarg]){
                    var out = metadata[kwarg]
                }
                
                return out
            
            }
        }
    }
    
    return handler()
}