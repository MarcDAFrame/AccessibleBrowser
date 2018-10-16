function request_template(url){
    return new Promise((resolve, reject) => {
        $.get(url, function(data) {

        })
        .done(function(data) {
            return resolve(data);
        })
        .fail(function(err) {
            console.log( err );
            reject();
        })
        .always(function() {

        });
    });
}

async function get_template(url){
    get_url = server_url + "get_template?url="+url
    template = await request_template(get_url);
    
    return template;
}