(function(){
    $('.transparency__slider').slider({
        range: "min",
        value: 1,
        min: 0,
        max: 1,
        orientation: "horizontal",
        step: 0.05,
        slide: changeOpacity
    });
    function changeOpacity(){
        var opacity = $('.transparency__slider').slider("value");

        $('.window__wm').css('opacity', opacity);
        $('.transparency__input--hidden').val(opacity);
    };
}());