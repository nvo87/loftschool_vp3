(function(){

    var watermark = $('.window__wm');
        //yPosition = watermark.offset().top,
        //xPosition = watermark.offset().left;

    $('.window__wm').draggable({
        containment: "parent"
    });

    watermark.on('mousemove', function(){
        $('.settings__position-x').text(parseInt(watermark.offset().left));
        $('.settings__position-y').text(parseInt(watermark.offset().top));
    });
}());