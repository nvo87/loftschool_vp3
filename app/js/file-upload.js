	$(function () {
		'use strict';
		// Change this to the location of your server-side upload handler:
		var url      = './php/upload.php',
			formFile = $('.file-load__input-file'),
			winWM    = $('.window__wm'),
			winBG    = $('.window__bg'),
			scaleBG  = 1; // запоминает масштаб главной картинки. TODO: избавится от глобальности, че-то стремно

		var MAX_WIDTH_BG  = 651,
			MAX_HEIGHT_BG = 534,
			FORMAT_WINDOW_BG = MAX_WIDTH_BG / MAX_HEIGHT_BG;

			//console.log(FORMAT_WINDOW_BG);

		formFile.fileupload({
			url: url,
			allowedTypes:"png,gif,jpg,jpeg",
			dataType: 'json',
			success: function (data) {
				var _this=this.fileInputClone, 			//получение объекта, инициализировавшего вызов fileupload
					fakeInput = _this.parent().find('.file-load__input-text'),
					fakeInputID = _this.attr('id');		//id, чтобы определить куда грузить картинку, в bg или в wm

					fakeInput.val(data.name);			//вписывает имя файла в инпут
					fileLoadWindow(data.rootUrl, fakeInputID, data.width, data.height);

					//console.log(data.width);
					//console.log(data.height);
			}
		})

		function fileLoadWindow(url, img, widthImg, heightImg){
			if (img === 'bg-file') {
				$('.bg-img').attr('src', url);
				magicResizer(img, widthImg, heightImg);
			} else if (img === 'wm-file') {
				$('.wm-img').attr('src', url);
				magicResizer(img, widthImg, heightImg);
			}
		};

		function magicResizer(img, widthImg, heightImg){
			var formatImg = widthImg / heightImg;
			//console.log(formatImg);
			switch(img) {
				case 'bg-file': // подгоняем основную картинку
					scaleBG = 1;
					// если картинка шире области - просчитываем высоту пропорционально при 100% ширине
					if (formatImg > FORMAT_WINDOW_BG) {
						if (widthImg > MAX_WIDTH_BG) {
							scaleBG = MAX_WIDTH_BG / widthImg;
							heightImg = heightImg * scaleBG;
							widthImg = MAX_WIDTH_BG;
							console.log(scaleBG);
						};
					// если картинка выше области - просчитываем ширину пропорционально при 100% высоте
					} else {
						if (heightImg > MAX_HEIGHT_BG) {
							scaleBG = MAX_HEIGHT_BG / heightImg;
							widthImg = widthImg * scaleBG;
							heightImg = MAX_HEIGHT_BG;
							console.log(scaleBG);
						};
					}
					winBG.css({
						'width': widthImg,
						'height': heightImg
					});
				break;
				case 'wm-file': // подгоняем ватермарк
				// console.log(scaleBG);
					winWM.css({
						'width': widthImg*scaleBG,
						'height': heightImg*scaleBG
					});
			    break;
			}
		}

	});


