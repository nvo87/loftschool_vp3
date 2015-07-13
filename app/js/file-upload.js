	$(function () {
		'use strict';
		// Change this to the location of your server-side upload handler:
		var url = './php/upload.php',
			formFile = $('.file-load__input-file');

		formFile.fileupload({
			url: url,
			allowedTypes:"png,gif,jpg,jpeg",
			dataType: 'json',
			success: function (data) {
				var _this=this.fileInputClone, 			//получение объекта, инициализировавшего вызов fileupload
					fakeInput = _this.parent().find('.file-load__input-text'),
					fakeInputID = _this.attr('id');		//id, чтобы определить куда грузить картинку, в bg или в wm

					fakeInput.val(data.name);			//вписывает имя файла в инпут
					fileLoadWindow(data.rootUrl, fakeInputID);

					console.log(data.width);
					console.log(data.height);
			}
		})

		function fileLoadWindow(url, img){
			if (img === 'bg-file') {
				$('.bg-img').attr('src', url);
			} else if (img === 'wm-file') {
				$('.wm-img').attr('src', url);
			}
		};
	});


