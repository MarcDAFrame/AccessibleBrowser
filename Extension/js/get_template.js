function request_template(url){
    return new Promise((resolve, reject) => {
        $.get(url, function(data) {
            // console.log(data);
        })
        .done(function(data) {
            // console.log(data);
            if (data.matched){
                return resolve(data);
            }


            // return Promise.reject();
        })
        .fail(function(err) {
            console.log( err );
            reject();
        })
        .always(function() {
            // console.log( "finished" );
        });
    });
}

async function get_template(url){
    get_url = server_url + "get_template?url="+url
    template = await request_template(get_url);
    // .then(function(data){
        // return data;
    // }).then(function(err){
        // return null;
    // });
    
    return template;
}