$(function () {
    'use strict';

    // Change this to the location of your server-side upload handler:
    var url = './php/upload/',
    	formFile = $('.file-load__input-file');
    	
    formFile.fileupload({
        url: url,
        allowedTypes:"png,gif,jpg,jpeg",
        dataType: 'json',
        add: function (e, data) {
            data.submit();
        },
        done: function (e, data) {
    	 	var fakeInput = $(this).parent().find('.file-load__input-text'),
    	 		fakeInputID = $(this).attr('id');
	    	 $.each(data.result.files, function (index, file) {
	    	 	fakeInput.val(file.name);
	   			fileLoadWindow(file.url, fakeInputID);
	        });
        }
    });

    function fileLoadWindow(url, img){
    	if (img === 'bg-file') {
    		$('.bg-img').attr('src', url);
    	} else if (img === 'wm-file') {
			$('.wm-img').attr('src', url);
    	}
    };

});