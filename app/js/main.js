jQuery(window).load(function() {

	var wmGeneratorApp = (function () {
		
		var
			_window 		 = $('.main__window'),				//главное окно, где лежит контейнер с картинкой и вотермаркой
			MAX_WIDTH_BG  	 = _window.width() || 651,			//максимальные размеры фоновой картинки, задаются по размерам главного окна
			MAX_HEIGHT_BG	 = _window.height() || 534,
			FORMAT_WINDOW_BG = MAX_WIDTH_BG / MAX_HEIGHT_BG,
			_scaleBG 		 = 1 , 								// запоминает масштаб главной картинки. TODO: избавится от глобальности, че-то стремно
			
			_bgWindow 	= _window.find('.window__bg'),		//контейнер с главным изображением
			_bgImg 		= _bgWindow.find('.bg-img'),		//главное изображение
			_bgWidth	= _bgWindow.width(),
			_bgHeight	= _bgWindow.height(),

			_wmWindow 	= _window.find('.window__wm'),		//контейнер с вотермаркой
			_wmImg 		= _wmWindow.find('.wm-img'),		//ватермарка
			_wmWidth	= _wmWindow.width(),
			_wmHeight	= _wmWindow.height(),

			_settingsForm 	= $('.wm-generator__settings'),						//блок с настройками
			_settingsMode	= 'position',										//режим в котором работаем, position - перемещение ватермарки, clone - клонириование

			_uploadsBlock 	= _settingsForm.find('.settings__upload'),			//блок загрузки файлов
				_fileInput	= _uploadsBlock.find('.file-load__input-file'),		//получение файл-инпутов на форме

			_positionBlock 	= _settingsForm.find('.settings__position'),		//блок позиционирования ватермарки
				_xInput		= _positionBlock.find('#x-axis'),					//поля для вывода координат ватермарки
				_yInput		= _positionBlock.find('#y-axis'),
				_squares	= _positionBlock.find('.square-td'),				//квадратики для позиционирования по опорным точкам
				_arrows		= _positionBlock.find('.coordinates_arrows'),		//стрелочки увеличения значений в полях вывода

			_opacityBlock 	= _settingsForm.find('.settings__transparency'),	//блок изменения прозрачности
				_slider 	= _opacityBlock.find('.transparency__slider'),		//слайдер изменения прозрачности
				_opacityValue = _opacityBlock.find('.transparency__input--hidden'),	//скрытый инпут, в него переносится значение со слайдера для передачи в php

			_buttonsBlock 	= _settingsForm.find('.settings__buttons'),
				_submitBtn	= _buttonsBlock.find('.btn-submit'),
				_resetBtn	= _buttonsBlock.find('.btn-reset');

		function _setUpListeners () {
			_wmWindow.on('mousemove', _getCoordinates);	//выводить координаты ватермарки при перетаскивании ее мышкой
			_arrows.on('click', _arrowsClickHandler);	//перемещение ватермарки при нажатии на кнопки X и Y
			_squares.on('click', _positionWM);			//позиционирование ватермарки по опорным точкам фоновой картинки
		}

		/*инициализация свойства draggable (перетаскивание мышкой)*/
		function _draggableInit () {
			_wmWindow.draggable({
				containment: "parent"
			});
		}

		/*инициализация слайдера для изменения прозрачности*/
		function _opacitySliderInit () {
			_slider.slider({
			    range: "min",
			    value: 1,
			    min: 0,
			    max: 1,
			    orientation: "horizontal",
			    step: 0.05,
			    slide: changeOpacity
			});
			function changeOpacity(){
			    var opacity = _slider.slider("value");

			    _wmWindow.css('opacity', opacity);
			    _opacityValue.val(opacity); //значение заносится в скрытый инпут для передачи в php
			};
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
						fileLoadWindow(data.rootUrl, data.width, data.height, fakeInputID);	//загрузка картинки в свой контейнер

				}
			});

			/**
			 * Загрузка изображений в главное окно
			 * @param  {string} url       Путь для загружаемого изображения
			 * @param  {number} widthImg  Оригинальная ширина загружаемого изображения
			 * @param  {number} heightImg Оригинальная высота загружаемого изображения
			 * @param  {string} img       Вид картинки - фон или вотермарка
			 */
			function fileLoadWindow(url, widthImg, heightImg, img){
				if (img === 'bg-file') {
					_bgImg.attr('src', url);
					magicResizer(img, widthImg, heightImg);
				} else if (img === 'wm-file') {
					_wmImg.attr('src', url);
					magicResizer(img, widthImg, heightImg);
				}
			}

			function magicResizer(img, widthImg, heightImg){
				var formatImg = widthImg / heightImg;

				//console.log(formatImg);
				switch(img) {
					case 'bg-file': // подгоняем основную картинку
						_scaleBG = 1;
						// если картинка шире области - просчитываем высоту пропорционально при 100% ширине
						if (formatImg > FORMAT_WINDOW_BG) {
							if (widthImg > MAX_WIDTH_BG) {
								_scaleBG = MAX_WIDTH_BG / widthImg;
								heightImg = heightImg * _scaleBG;
								widthImg = MAX_WIDTH_BG;
								//console.log(_scaleBG);
							};
						// если картинка выше области - просчитываем ширину пропорционально при 100% высоте
						} else {
							if (heightImg > MAX_HEIGHT_BG) {
								_scaleBG = MAX_HEIGHT_BG / heightImg;
								widthImg = widthImg * _scaleBG;
								heightImg = MAX_HEIGHT_BG;
								//console.log(_scaleBG);
							};
						}
						_bgWindow.css({
							'width': widthImg,
							'height': heightImg
						});
					break;
					case 'wm-file': // подгоняем ватермарк
					// console.log(_scaleBG);
						_wmWindow.css({
							'width': widthImg * _scaleBG,
							'height': heightImg * _scaleBG
						});
				    break;
				}
			} //end magicResizer
		} //end _fileupload()

		/*Обработка нажатия на квадрат для точного позиционирования ватермарки*/
		function _positionWM (e) {
			e.preventDefault();

			var $this=$(this);

			_wmWindow.position({
				my: $this.attr('data-pos-x') + " " + $this.attr('data-pos-y'),
				at: $this.attr('data-pos-x') + " " + $this.attr('data-pos-y'),
				of: _bgWindow
			});

			_getCoordinates();
			_squares.removeClass('square-td--active');
			$this.addClass('square-td--active');
		} //end _positionWM()

		function _arrowsClickHandler (e) {
			e.preventDefault();

			if (_settingsMode === 'position') {					//режим перемещения ватермарки
				
				var arrow 	=$(this), 							//сохраняем стрелку по которой нажали
					axis 	= arrow.attr('data-axis'),			//получение по какой оси работает кнопка
					dir 	= arrow.attr('data-dir');			//получение направления действия кнопки (увеличить или уменьшить)

				_changeCoordinates(axis, dir); 					//перемещение ватермарки по нужной оси, в нужном направлении

			} else if (_settingsMode === 'clone') {				//режим клонирования ватермарки
				// вызов функций для режима клонирования
			}
		}

		/**
		 * Перемещение ватермарки после нажатия на стрелочки
		 * @param  {[string]} axis Ось, по которой перемещать вотремарку
		 * @param  {[string]} dir  Направление, принимает UP - в сторону увеличения, DOWN - в сторону уменьшения
		 */
		function _changeCoordinates (axis, dir) {
			//e.preventDefault();

			var xEnd 	= _bgWidth - _wmWidth + 1, 			// крайняя позиция X
				yEnd 	= _bgHeight - _wmHeight + 1, 		// крайняя позиция Y
				innerX  = _getCoordinates().x,				// текущая X координата ватермарки
				innerY  = _getCoordinates().y,				// текущая Y координата ватермарки

				step 	= 5;								// шаг сдвига ватермарки, в пикселях

			if (axis === 'X') {
				if (dir === 'UP') {

						if(_checkBorders(innerX, xEnd)) { 				//проверка границ, текущей координаты innerX в пределах xEnd
							_moveWatermark(innerX, step, 'left');		//сдвинуть ватермарку, с координаты innerX на величину step по оси X
							_getCoordinates();							//вывести конечные координаты в поля X, Y
						} else {
							_moveWatermark(0, step, 'left');			//если вылазит за границу, то сбросить на начала экрана - сдвигать с координаты 0.
						}		

				} else if (dir === 'DOWN') {

						if(_checkBorders(innerX, xEnd)) {
							_moveWatermark(innerX, -step, 'left');
							_getCoordinates();
						} else {
							_moveWatermark(xEnd , -step, 'left');
						}

				}
			} else if (axis === 'Y') {
				if (dir === 'UP') {

						if(_checkBorders(innerY, yEnd)) {
							_moveWatermark(innerY, step, 'top');
							_getCoordinates();
						} else {
							_moveWatermark(0, step, 'top');
						}

				} else if (dir === 'DOWN') {

						if(_checkBorders(innerY, yEnd)) {
							_moveWatermark(innerY, -step, 'top');
							_getCoordinates();
						} else {
							_moveWatermark(yEnd , -step, 'top');
						}

				}
			}			
		} // end _changeCoordinates()

		/*Получение и вывод координат ватермарки в окошки X и Y*/
		/* Например, чтобы получить x=_getCoordinates().x */
		function _getCoordinates () {
			//вычисление координат относительно начала фоновой картинки
			var posX = _wmWindow.offset().left - _bgWindow.offset().left, 
				posY = _wmWindow.offset().top - _bgWindow.offset().top;

			_xInput.val(parseInt(posX)); //вывод координаты в поле X
			_yInput.val(parseInt(posY));

			return {
				x : posX,
				y : posY
			};
		} //end _getCoordinates()

		/**
		 * Проверка выходит ли ватермарка за границы фонового изображения
		 * @param  {number} value 	значение текущей координаты
		 * @param  {number} end   	верхний предел границы
		 * @return {bool}   true	если текущая координата в пределах границы
		 */
		function _checkBorders (value, end) {
			if ((value > 0 ) && (value < end)) {
				return true;
			} else {
				return false;
			}
		}

		/**
		 * Перемещение ватермарки
		 * @param  {number} value начальная координата
		 * @param  {number} step  величина сдвига
		 * @param  {string} axis  ось смещения, принимает 'left' или 'top'
		 */
		function _moveWatermark (value, step, axis) {
			value += step;
			_wmWindow.css(axis, value);
		}


		return {
			init: function () {
				_setUpListeners();
				_fileUpload ();
				_draggableInit ();
				_opacitySliderInit ();
			}
		};

	}());

	wmGeneratorApp.init();

});