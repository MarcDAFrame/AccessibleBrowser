"use strict";

var Page = {
    init: function () {
        $(window).on("load", () => { this.onPageLoad() });

        $("html").css("overflow", "hidden");
        $("html").append("<overlay></overlay");
        $("html > overlay").css({"position": "absolute", "z-index": 1000000, "top": 0, "left": 0, "bottom": 0, "right": 0, "background": "#ffffff", "overflow": "auto", "width": "100%", "height": "100%"})
    },
    onPageLoad: function () {
        console.log("onPageLoad");

        var conf = {
            "type": "ListView",
            "selector": ".th",
            "rows": "tr",
            "columns": [
                "td:nth-of-type(2)",
                "td:nth-of-type(3)",
                "td:nth-of-type(4)"
            ],
            "style": {
                "margin": "2em auto",
                "width": "80%",
                "border-collapse": "collapse",
                "border": "1px solid black"
            },
            "cellStyle": {
                "border-bottom": "1px solid black",
                "padding": "5px",
                "font-size": "16px"
            }
        }

        var lv = ListView(conf);

        $("overlay").append(lv.render());
    }
}

Page.init();