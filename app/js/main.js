jQuery(document).ready(function($) {

	var wmGeneratorApp = (function () {
		
		var
			_window 	= $('.main__window'),				//главное окно, где лежит контейнер с картинкой и вотермаркой
			
			_bgWindow 	= _window.find('.window__bg'),		//контейнер с главным изображением
			_bgImg 		= _bgWindow.find('.bg-img'),		//главное изображение
			_bgWidth	= _bgWindow.width(),
			_bgHeight	= _bgWindow.height(),

			_wmWindow 	= _window.find('.window__wm'),		//контейнер с вотермаркой
			_wmImg 		= _wmWindow.find('.wm-img'),		//ватермарка
			_wmWidth	= _wmWindow.width(),
			_wmHeight	= _wmWindow.height(),
			
			_settingsForm 	= $('.wm-generator__settings'),						//блок с настройками

			_uploadsBlock 	= _settingsForm.find('.settings__upload'),			//блок загрузки файлов
				_fileInput	= _uploadsBlock.find('.file-load__input-file'),		//получение файл-инпутов на форме

			_positionBlock 	= _settingsForm.find('.settings__position'),		//блок позиционирования ватермарки
				_xInput		= _positionBlock.find('#x-axis'),					//поля для вывода координат ватермарки
				_yInput		= _positionBlock.find('#y-axis'),
				_xUp 		= _positionBlock.find('.x-arrows-up'),				//стрелочки увеличения значений в полях вывода
				_xDown 		= _positionBlock.find('.x-arrows-down'),
				_yUp 		= _positionBlock.find('.y-arrows-up'),
				_yDown 		= _positionBlock.find('.y-arrows-down');

		function _setUpListeners () {
			_wmWindow.on('mousemove', _showCoordinates);	//выводить координаты ватермарки при перетаскивании ее мышкой
		}

		/*инициализация модуля jquery-file-upload, загрузчик картинок*/
		function _fileUpload () {
			'use strict';
			var url = './php/upload.php';					// Change this to the location of your server-side upload handler:	

			_fileInput.fileupload({
				url: url,
				allowedTypes:"png,gif,jpg,jpeg",
				dataType: 'json',
				success: function (data) {
					var _this		= this.fileInputClone, 			//получение файл-инпута, инициализировавшего вызов fileupload; fileInputClone - внутреннее свойство объекта fileupload()
						fakeInput 	= _this.parent().find('.file-load__input-text'), //соответствующий инпут для вывода имени файла
						fakeInputID = _this.attr('id');				//id, чтобы определить куда грузить картинку, в bg или в wm

						fakeInput.val(data.name);					//вписывает имя файла в инпут
						fileLoadWindow(data.rootUrl, fakeInputID);	//загрузка картинки в свой контейнер

						console.log(data.width);
						console.log(data.height);
				}
			});

			function fileLoadWindow(url, img){
				if (img === 'bg-file') {
					_bgImg.attr('src', url);
				} else if (img === 'wm-file') {
					_wmImg.attr('src', url);
				}
			}
		}

		/*инициализация свойства draggable (перетаскивание мышкой)*/
		function _draggableInit () {
			_wmWindow.draggable({
				containment: "parent"
			});
		}

		/*Вывод координат ватермарки в окошки X и Y*/
		function _showCoordinates () {
			_xInput.val(parseInt(_wmWindow.offset().left - _bgWindow.offset().left));
			_yInput.val(parseInt(_wmWindow.offset().top - _bgWindow.offset().top));
		}

		function _changeCoordinates () {
			
		}

		return {

			init: function () {
				_setUpListeners();
				_fileUpload ();
				_draggableInit ();
			}


		};

	}());

	wmGeneratorApp.init();

});