(function(){

    var watermark = $('.window__wm'),
        parent = $('.bg-img');

    $('.window__wm').draggable({
        containment: "parent"
    });

    watermark.on('mousemove', function(){
        $('.settings__position-x').text(parseInt(watermark.offset().left - parent.offset().left));
        $('.settings__position-y').text(parseInt(watermark.offset().top - parent.offset().top));
        watermark.css('cursor', 'move');
    });
}());