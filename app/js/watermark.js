(function(){

    var watermark = $('.window__wm'),
        parent = $('.bg-img');

    $('.window__wm').draggable({
        containment: "parent"
    });

    watermark.on('mousemove', function(){
        $('#x-axis').val(parseInt(watermark.offset().left - parent.offset().left));
        $('#y-axis').val(parseInt(watermark.offset().top - parent.offset().top));
    });
}());