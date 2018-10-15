function ListView(config) {
    self = {
        render: function () {
            var table = $('<table class="listview">');
            var srcElement = $(config.selector);
            var rows = srcElement.find(config.rows);

            table.css(config.style);

            rows.each(function () {
                var srcRow = $(this);
                var row = $('<tr class="row">');

                for (var colSelector of config.columns) {
                    var cell = $('<td class="column">');

                    cell.text(srcRow.find(colSelector).text());

                    if (config.cellStyle)
                        cell.css(config.cellStyle);

                    row.append(cell);
                }

                table.append(row);
            });

            return table;
        }
    }

    return self;
}