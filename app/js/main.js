jQuery(window).load(function() {

	var wmGeneratorApp = (function () {
		
		var
			_window 		 = $('.main__window'),				//главное окно, где лежит контейнер с картинкой и вотермаркой
			MAX_WIDTH_BG  	 = _window.width() || 651,			//максимальные размеры фоновой картинки, задаются по размерам главного окна
			MAX_HEIGHT_BG	 = _window.height() || 534,
			FORMAT_WINDOW_BG = MAX_WIDTH_BG / MAX_HEIGHT_BG,
			_scaleBG 		 = 1 , 								// запоминает масштаб главной картинки

			MAX_WIDTH_TILE_WM    = 3000, 					// максимальная ширина окна с кучей ватермарков
			MAX_HEIGHT_TILE_WM   = 3000, 					// максимальная высота окна с кучей ватермарком
			
			_bgWindow 	= _window.find('.window__bg'),			//контейнер с главным изображением
			_bgImg 		= $('<img>', {'class': 'bg-img'}),		//заготовка главного изображения
			_bgWidth	= _bgWindow.width(),
			_bgHeight	= _bgWindow.height(),

			_wmWindow 	= _window.find('.window__wm'),			//контейнер с вотермаркой
			_wmImg 		= $('<img>', {'class': 'wm-img'}),		//заготовка ватермарка
			_wmWidth	= _wmWindow.width(),
			_wmHeight	= _wmWindow.height(),

			_settingsForm 	= $('.wm-generator__settings'),						//блок с настройками

			_uploadsBlock 	= _settingsForm.find('.settings__upload'),			//блок загрузки файлов
				_fileInput	= _uploadsBlock.find('.file-load__input-file'),		//получение файл-инпутов на форме

			_positionBlock 	= _settingsForm.find('.settings__position'),		//блок позиционирования ватермарки
				_xInput		= _positionBlock.find('#x-axis'),					//поля для вывода координат ватермарки
				_yInput		= _positionBlock.find('#y-axis'),
				_xLabel		= _positionBlock.find('.x-multi'),					//надписи X и Y, либо рисунок стрелочки
				_yLabel		= _positionBlock.find('.y-multi'),
				_squares	= _positionBlock.find('.square-td'),				//квадратики для позиционирования по опорным точкам
				_arrows		= _positionBlock.find('.coordinates_arrows'),		//стрелочки увеличения значений в полях вывода
				_switchSingle = $('.switch__single'), 							//включение режима "замостить"
				_switchMulti  = $('.switch__multi'), 							//включение режима "замостить"
				_switchValue  = $('.switch__input--hidden'), 					//скрытый инпут, для передачи режима в php
				_switchMode	= 'single',											//режим в котором работаем, single - перемещение ватермарки, multi - клонириование

			_opacityBlock 	= _settingsForm.find('.settings__transparency'),	//блок изменения прозрачности
				_slider 	= _opacityBlock.find('.transparency__slider'),		//слайдер изменения прозрачности
				_opacityValue = _opacityBlock.find('.transparency__input--hidden'),	//скрытый инпут, в него переносится значение со слайдера для передачи в php

			_buttonsBlock 	= _settingsForm.find('.settings__buttons'),
				_submitBtn	= _buttonsBlock.find('.btn-submit'),
				_resetBtn	= _buttonsBlock.find('.btn-reset'),

			_verticLine = $('.line-vertical'),            // вертик. линия для отображения отступа слева
			_horizLine = $('.line-horizontal'),           // горизонт. линия для отображения отступа сверху
			_lineParent = $('.position__square-wrap');    // обертка для миниатюры;

		function _setUpListeners () {
			_wmWindow.on('mousemove', _getCoordinates);	//выводить координаты ватермарки при перетаскивании ее мышкой
			_arrows.on('click', _arrowsClickHandler);	//перемещение ватермарки при нажатии на кнопки X и Y
			_squares.on('click', _positionWM);			//позиционирование ватермарки по опорным точкам фоновой картинки
			_switchMulti.on('click', _tileWatermark);
			_switchSingle.on('click', _switchSingleSettings);
			_resetBtn.on('click', _resetApp);
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
					_bgImg.attr('src', url).appendTo(_bgWindow);
					magicResizer(img, widthImg, heightImg);
				} else if (img === 'wm-file') {
					_wmImg.attr('src', url).appendTo(_wmWindow);
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

			if (_switchMode === 'single') {					//режим перемещения ватермарки
				
				var arrow 	=$(this), 							//сохраняем стрелку по которой нажали
					axis 	= arrow.attr('data-axis'),			//получение по какой оси работает кнопка
					dir 	= arrow.attr('data-dir');			//получение направления действия кнопки (увеличить или уменьшить)

				_changeCoordinates(axis, dir); 					//перемещение ватермарки по нужной оси, в нужном направлении

			} else if (_switchMode === 'multi') {				//режим клонирования ватермарки
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

			if (/*_switchValue.val('multi')*/_positionBlock.hasClass('wm-multi')){                  // действия при включении режима "замостить"
				_wmMarginChange(axis, dir)
			} else {
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
			}
		} // end _changeCoordinates()

		function _wmMarginChange(axis, dir){
			var	_verticLineWidth = _verticLine.width(),   // ширина вртик. линии
				_horizLineHeight = _horizLine.height(),   // высота горизонт. линии
				_parentWidth = _lineParent.width(),       // ширина обертки миниатюры
				_parentHeight = _lineParent.height(),     // высота обертки миниатюры
				_stepChange = 1,                          // шаг для изменения ширины и высоты линий
				_newLineWidth,                            // измененная ширина вертик. линии
				_newLineHeight,                           // измененная высота горизонт. линии
				_innerLeft,                               // центрирование вертик. линии после изменения ширины
				_innerTop;                                // центрирование горизонт. линии после изменения высоты

			if (axis === 'X') {
				if (dir === 'UP') {
					// изменнение высоты гориз. линии на 1px
					_newLineHeight = _horizLineHeight + _stepChange;
					// центрирование гориз. линии относительно родителя
					_innerTop = (_parentHeight - _newLineHeight)/2;

					if(_newLineHeight < _parentHeight){
						_horizLine.css({
							height : _newLineHeight,
							top : _innerTop
						});
					}
				} else if (dir === 'DOWN') {
					_newLineHeight = _horizLineHeight - _stepChange;
					_innerTop = (_parentHeight - _newLineHeight)/2;

					if(_newLineHeight < -1){
						_horizLine.css({
							height : 0,
							top : "50%"
						});
					} else{
						_horizLine.css({
							height : _newLineHeight,
							top : _innerTop
						});
					}
				}
				_getMargin();
			} else {
				if (axis === 'Y') {
					if (dir === 'UP') {
						_newLineWidth = _verticLineWidth + _stepChange;
						_innerLeft = (_parentWidth - _newLineWidth)/2;
						if(_newLineWidth < _parentWidth) {
							_verticLine.css({
								width: _newLineWidth,
								left: _innerLeft
							});
						}
					} else if (dir === 'DOWN') {
						_newLineWidth = _verticLineWidth - _stepChange;
						_innerLeft = (_parentWidth - _newLineWidth)/2;

						if(_newLineWidth < -1){
							_verticLine.css({
								width : 0,
								left : "50%"
							});
						} else {
							_verticLine.css({
								width : _newLineWidth,
								left : _innerLeft
							});
						}
					}
					_getMargin();
				}
			}
		}

		/*Получение и вывод координат ватермарки в окошки X и Y*/
		/* Например, чтобы получить x=_getCoordinates().x */
		function _getCoordinates () {
			//вычисление координат относительно начала фоновой картинки
			var posX = _wmWindow.offset().left - _bgWindow.offset().left, 
				posY = _wmWindow.offset().top - _bgWindow.offset().top;

				_xInput.val(parseInt(posX)); //вывод координаты в поле X
				_yInput.val(parseInt(posY));

				return {
					x: posX,
					y: posY
				};
		} //end _getCoordinates()

		function _getMargin() {
			//var horizLineHeight = _horizLine.height(),     // высота горизонт. линии
			//	verticLineWidth = _verticLine.width();     // ширина вертик. линии
			//
			//if (_switchValue.val('multi')) {
			//	_xInput.val(parseInt(horizLineHeight));    // вывод высоты горизонтальной линии
			//	_yInput.val(parseInt(verticLineWidth));    // вывод ширины вертикальной линии
			//}
		}

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

		function _tileWatermark () {
			var widthWM  = _wmWindow.width(),
				heightWM = _wmWindow.height(),
				widthWMTile = MAX_WIDTH_TILE_WM - (MAX_WIDTH_TILE_WM % widthWM),
				heightWMTlie = MAX_HEIGHT_TILE_WM - (MAX_HEIGHT_TILE_WM % heightWM),
				countWM = Math.round((widthWMTile*heightWMTlie) / (widthWM*heightWM)),
				htmlWM = '',
				i = 0;

			_wmWindow
				.find('img').css({'width': widthWM, 'height': heightWM})
				.end()
				.addClass('window__wm_tile')
				.css({
					'width': widthWMTile,
					'height': heightWMTlie,
					'left': '-300',
					'top': '-300'
				});

			while (i < countWM) {
				htmlWM += _wmWindow.html();
				i++;
			}

			_wmWindow.append(htmlWM);
			_switchMultiSettings ();

		}

		function _switchMultiSettings () {
			_settingsMode = 'multi';
			_switchValue.val(_settingsMode);	
			_squares.removeClass('square-td--active');
			_positionBlock.addClass('wm-multi');
			_xLabel.removeClass('x-singl');
			_yLabel.removeClass('y-singl');	
		}

		function _switchSingleSettings () {
			_settingsMode = 'single';
			_switchValue.val(_settingsMode);	
			_squares.eq(0).addClass('square-td--active');
			_positionBlock.removeClass('wm-multi');
			_xLabel.addClass('x-singl');
			_yLabel.addClass('y-singl');	
		}

		function _resetApp () {
			_bgImg.remove();
			_wmImg.remove();

			var url = './php/reset.php';
			$.ajax({
				url: url,
				type: 'POST',
				data: {},
				dataType: '',
			})
			.done(function() {
				console.log("папка img/upload/ очищена");
			})
			.fail(function() {
				console.log("ошибка очистки папки");
			});

		function _submitApp () {
			var url = './php/test.php';

			$.ajax({
				url: url,
				type: 'POST',
				dataType: '',
				data: {val: 'value1'},
			})
			.done(function() {
				console.log("success");
			})
			.fail(function() {
				console.log("error");
			})
			.always(function() {
				console.log("complete");
			});
			
		}
			
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