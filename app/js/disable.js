;(function(){
	var checkDisabled = function () {
		if (!$('#bg-file').val() && !$('#bg-img-path').val()) {
			$('.disable').show();
		} else if (!$('#wm-file').val() && !$('#wm-img-path').val()) {
			$('.disable').addClass('disable-else');
		} else {
			$('.disable').hide(); 
		}
	};
	
	$(function () {
		checkDisabled();
		$('#bg-file, #wm-file').on('change', function () {
			checkDisabled();
		});
	});
})();