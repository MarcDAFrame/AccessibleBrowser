function transit_loader() {
    // console.log('transit loader')
    transitions = [
        //["transition-class-name", "transit-type", "default-value", "return value"]
        [".transit-pop", 'scale', '1.05', { scale: '1' }],
        [".transit-slide-x", 'x', '-5', { x: '0' }],
        [".transit-slide-y", 'y', '-5', { y: '0' }],
        [".transit-rotate", 'rotate', '15deg', { rotate: '0deg' }],
        [".transit-skew-x", 'skewX', '15deg', { skewX: '0deg' }],
        [".transit-skew-y", 'skewY', '15deg', { skewY: '0deg' }],

    ]
    $.each(transitions, function (id, attribute) {
        $(attribute[0]).each(function (index) {
            type = $(this).attr('type')
            if (type == 'hover') {
                $(this).hover(function () {
                    // console.log('hover')
                    // console.log($(this).attr('value'))
                    value = $(this).attr('value')
                    let dict = new Array()

                    if (value) {
                        dict[attribute[1]] = value
                        $(this).transition(dict);
                    } else {
                        value
                        dict[attribute[1]] = attribute[2]
                        $(this).transition(dict);
                    }

                },
                    function () {
                        $(this).transition(attribute[3]);
                    })
            } else if (type == 'click') {
                let clicked = false
                $(this).click(function () {
                    value = $(this).attr('value')
                    // console.log($(this).attr('value'))
                    let dict = new Array()
                    if (clicked) {
                        clicked = false
                        $(this).transition(attribute[3]);
                    } else {
                        clicked = true
                        if (value) {
                            dict[attribute[1]] = value
                            $(this).transition(dict);
                        } else {
                            value
                            dict[attribute[1]] = attribute[2]
                            $(this).transition(dict);
                        }
                    }


                })
            }


        })
    })


}
$(window).on('load', function () {
    transit_loader()
});