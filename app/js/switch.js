

$(document).ready(function() { 
  $('.switch__single').click(function(event) {
    $('.position__square').find('.square-tr').eq(0).find('.square-td').eq(0).addClass('square-td--active');
    $('.settings__position').removeClass('wm-multi'); 
    $('.x-multi').addClass('x-singl');
    $('.y-multi').addClass('y-singl');
  });
});

$(document).ready(function() { 
  $('.switch__multi').click(function(event) {
    $('.square-td').removeClass('square-td--active');
    $('.settings__position').addClass('wm-multi');
    $('.x-multi').removeClass('x-singl');
    $('.y-multi').removeClass('y-singl');
  });
});