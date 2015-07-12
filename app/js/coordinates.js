(function(){
    var xUp = $('.x-arrows-up'),
        xDown = $('.x-arrows-down'),
        yUp = $('.y-arrows-up'),
        yDown = $('.y-arrows-down'),
        watermark = $('.window__wm'),
        parent = $('.bg-img'),

        parentWidth = parent.width(),
        watermarkWidth = watermark.width(),
        // крайняя позиция X
        xEnd = parentWidth - watermarkWidth,
        parentHeight = parent.height(),
        watermarkHeight = watermark.height(),
        // крайняя позиция Y
        yEnd = parentHeight - watermarkHeight;


// Координаты X

    // увеличение значения X
    xUp.on('click', function(e){
        e.preventDefault();

        var innerX = watermark.offset().left - parent.offset().left;

        if(innerX === xEnd){
            xUp.on('click', function(e) {
                e.preventDefault();
            });
        } else{
            innerX++;
            //вывод позиции вотермарка, увеличенной на 1px, в виде целого числа
            $('#x-axis').val(parseInt(innerX));
            // присвоить вотермарку новую позицию, увеличенную на 1px
            watermark.css('left', innerX);
        }
    });

    // уменьшение значения X
    xDown.on('click', function(e){
        e.preventDefault();

        var innerX = watermark.offset().left - parent.offset().left;

        if(innerX === 0){
            xDown.on('click', function(e){
                e.preventDefault();
            });
        } else{
            innerX--;
            //вывод позиции вотермарка, уменьшенной на 1px, в виде целого числа
            $('#x-axis').val(parseInt(innerX));
            // присвоить вотермарку новую позицию, уменьшенную на 1px
            watermark.css('left', innerX);
        }
    });

// Координаты Y

    // увеличение значения Y
    yUp.on('click', function(e){
        e.preventDefault();

        var innerY = watermark.offset().top - parent.offset().top;

        //if(innerY === yEnd){
        //    yUp.on('click', function(e) {
        //        e.preventDefault();
        //    });
        //} else {
            innerY++;
            $('#y-axis').val(parseInt(innerY));
            watermark.css('top', innerY);
        //}
    });

    // уменьшение значения Y
    yDown.on('click', function(e){
        e.preventDefault();

        var innerY = watermark.offset().top - parent.offset().top;

        if(innerY === 0) {
            xDown.on('click', function (e) {
                e.preventDefault();
            });
        } else{
            innerY--;
            $('#y-axis').val(parseInt(innerY));
            watermark.css('top', innerY);
        }
    });
}());