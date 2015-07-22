jQuery(window).load(function() {

	var wmGeneratorApp = (function () {
		
		var
			_window 		 = $('.main__window'),				//главное окно, где лежит контейнер с картинкой и вотермаркой
			MAX_WIDTH_BG  	 = _window.width() || 651,			//максимальные размеры фоновой картинки, задаются по размерам главного окна
			MAX_HEIGHT_BG	 = _window.height() || 534,
			FORMAT_WINDOW_BG = MAX_WIDTH_BG / MAX_HEIGHT_BG,
			_scaleBG 		 = 1 , 								// запоминает масштаб главной картинки

			MAX_WIDTH_TILE_WM    = MAX_WIDTH_BG*3, 					// максимальная ширина окна с кучей ватермарков
			MAX_HEIGHT_TILE_WM   = MAX_HEIGHT_BG*3, 				// максимальная высота окна с кучей ватермарком
			
			_bgWindow 	= _window.find('.window__bg'),			//контейнер с главным изображением
			_bgImg 		= $('<img>', {'class': 'bg-img'}),		//заготовка главного изображения
			_bgWidth	= _bgWindow.width(),
			_bgHeight	= _bgWindow.height(),

			_wmWindow 	= _window.find('.window__wm'),			//контейнер с вотермаркой
			_wmImg 		= $('<img>', {'class': 'wm-img'}),		//заготовка ватермарка
			_wmWidth	= _wmWindow.width(),
			_wmHeight	= _wmWindow.height(),

			_settingsForm 	= $('.wm-generator__settings'),		//блок с настройками
			_form = _settingsForm.find('#form'),
			_disableLayer	= $('.disable'),					//слой, делающий настройки неактивными

			_uploadsBlock 	= _settingsForm.find('.settings__upload'),			//блок загрузки файлов
				_fileInput	= _uploadsBlock.find('.file-load__input-file'),		//получение файл-инпутов на форме
				_bgFileInput	= _uploadsBlock.find('#bg-file'),				//получение файл-инпутов на форме
				_wmFileInput	= _uploadsBlock.find('#wm-file'),				//получение файл-инпутов на форме
				_bgFilePath		= _uploadsBlock.find('#bg-img-path'),
				_wmFilePath		= _uploadsBlock.find('#wm-img-path'),
				_bgWidthValue	= _uploadsBlock.find('#bg-width-value'), 		//скрытый инпут с размерами фона, для передачи на сервер
				_bgHeightValue	= _uploadsBlock.find('#bg-height-value'),

			_positionBlock 	= _settingsForm.find('.settings__position'),		//блок позиционирования ватермарки
				_xInput		= _positionBlock.find('#x-axis'),					//поля для вывода координат ватермарки
				_yInput		= _positionBlock.find('#y-axis'),
				_xLabel		= _positionBlock.find('.x-singl'),					//надписи X и Y, либо рисунок стрелочки
				_yLabel		= _positionBlock.find('.y-singl'),
				_squares	= _positionBlock.find('.square-td'),				//квадратики для позиционирования по опорным точкам
				_arrows		= _positionBlock.find('.coordinates_arrows'),		//стрелочки увеличения значений в полях вывода
				_switchSingle = $('.switch__single'), 							//выключение режима "замостить"
				_switchMulti  = $('.switch__multi'), 							//включение режима "замостить"
				_switchMode	  = 'single',											//режим в котором работаем, single - перемещение ватермарки, multi - клонириование
				_coordinatesValue = _positionBlock.find('#wm-coords'),							//скрытый инпут с координатами ватермарок

				_currentDataWM = {}, // хранилище текущих данных позиции и размера вотермарка для переключения режима отображения

			_opacityBlock 	= _settingsForm.find('.settings__transparency'),	//блок изменения прозрачности
				_slider 	= _opacityBlock.find('.transparency__slider'),		//слайдер изменения прозрачности
				_opacityValue = _opacityBlock.find('.transparency__input--hidden'),	//скрытый инпут, в него переносится значение со слайдера для передачи в php
				OPACITY_DEFAULT = 0.5,

			_buttonsBlock 	= _settingsForm.find('.settings__buttons'),
				_submitBtn	= _buttonsBlock.find('.btn-submit'),
				_resetBtn	= _buttonsBlock.find('.btn-reset'),

			_verticLine = $('.line-vertical'),            // вертик. линия для отображения отступа слева
			_horizLine = $('.line-horizontal'),           // горизонт. линия для отображения отступа сверху
			_lineParent = $('.position__square-wrap');    // обертка для миниатюры;

		function _setUpListeners () {
			_bgFileInput.on('change', _checkDisabled);			//проверка - разблокировать ли другие элементы интерфейса
			_wmFileInput.on('change', _checkDisabled);	
			_switchSingle.on('click', _switchSingleSettings);	//переключение в режим перемещения, далее single
			_switchMulti.on('click', _switchMultiSettings);		//переключение в режим замостить, далее multi
			_arrows.on('click', _arrowsClickHandler);			//обработка нажатия по стрелочкам в зависимости от режима
			_squares.on('click', _positionWM);					//позиционирование ватермарки по опорным точкам фоновой картинки
			_wmWindow.on('mousemove', _dragWM);					//выводить координаты ватермарки при перетаскивании ее мышкой
			_resetBtn.on('click', _resetApp);					//сброс
			_submitBtn.on('click', _submitApp);					//сохранить
		}

	///////////////////////////////
	//загрузка свойств элементов //
	///////////////////////////////

		/*блокировка интерфеса*/
		function _checkDisabled () {
			if (!_bgFileInput.val()) {
				_disableLayer.removeClass('disable-else').show();
			} else if (!_wmFileInput.val()) {
				_disableLayer.addClass('disable-else');
			} else {
				_disableLayer.hide(); 
			}
		}

		/*загрузчик картинок, инициализация модуля jquery-file-upload*/
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
						_getParametrs();							//получает размеры загруженных, отмасштабированых картинок
						_changeOpacity(OPACITY_DEFAULT);				//установить начальную прозрачность для ватермарки
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
							};
						}
						_bgWindow.css({
							'width': widthImg,
							'height': heightImg
						});
					break;
					case 'wm-file': // подгоняем ватермарк
						_wmWindow.css({
							'width': widthImg * _scaleBG,
							'height': heightImg * _scaleBG
						});
				    break;
				}
			} //end magicResizer
		} //end _fileupload()

		/*инициализация свойства draggable (перетаскивание мышкой)*/
		function _draggableInit (contain) {
			var contVal,
				contain = contain;
			if (contain === 'free') {
				contVal = '';
			} else {
				contVal = 'parent';
			}
			_wmWindow.draggable({
				containment: contVal
			});
		}

		/*реакция на перетаскивание - показ текущих координат (_getCoordinates()), только в режиме "сингл"*/
		function _dragWM () {
			if (_switchMode === 'single') {
				_getCoordinates();
			};
		}

		/*инициализация "квадрата" для точного позиционирования ватермарки, только в режиме "сингл"*/
		function _positionWM (e) {
			e.preventDefault();

			if (_switchMode === 'multi') return;

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

		/*инициализация слайдера изменения прозрачности*/
		function _opacitySliderInit () {
			_slider.slider({
			    range: "min",
			    value: OPACITY_DEFAULT,
			    min: 0,
			    max: 1,
			    orientation: "horizontal",
			    step: 0.05,
			    slide: function(){
			    	_changeOpacity();
			    }
			});
		}
		/*Изменение прозрачности ватермарки*/
		function _changeOpacity(opacity){
			if (typeof opacity === 'undefined') {
				opacity = _slider.slider('value');
			}

		    _wmWindow.css('opacity', opacity);
		    _opacityValue.val(opacity); //значение заносится в скрытый инпут для передачи в php
		}

	//////////////////////
	//обработка событий //
	//////////////////////

		/*Переход в режим перемещения (single)*/
		function _switchSingleSettings () {
			_switchMode = 'single';

			_oneWatermark ();								//отобразить одну ватермарку
			_getCoordinates ();								//показать в полях X Y текущие координаты

			_xLabel.addClass('x-singl');					//поменять надписи у полей X Y
			_yLabel.addClass('y-singl');	

			_positionBlock.removeClass('wm-multi');			//переключить "квадрат" в режим позиционирования
			_squares.eq(0).addClass('square-td--active');
		}

		/*Переход в режим замощения (multi)*/
		function _switchMultiSettings () {
			_switchMode = 'multi';

			_tileWatermark ();									//замостить ватермарку
			_getMargin ();										//показать в полях X Y текущие отступы

			_xLabel.removeClass('x-singl').addClass('x-multi'); //поменять надписи у полей X Y
			_yLabel.removeClass('y-singl').addClass('y-multi');

			_positionBlock.addClass('wm-multi');				//переключить "квадрат" в режим замощения
			_squares.removeClass('square-td--active');
		}

		/*обработчик нажатий на стрелочки*/
		function _arrowsClickHandler (e) {
			e.preventDefault();
			var arrow 	= $(this), 							//сохраняем стрелку по которой нажали
				axis 	= arrow.attr('data-axis'),			//получение по какой оси работает кнопка
				dir 	= arrow.attr('data-dir');			//получение направления действия кнопки (увеличить или уменьшить)

			if (_switchMode === 'single') {					//режим перемещения ватермарки
				_changeCoordinates(axis, dir); 				//перемещение ватермарки по нужной оси, в нужном направлении
				_getCoordinates();							//вывести на экран
			} else if (_switchMode === 'multi') {			//режим клонирования ватермарки
				_changeMargin(axis, dir);					//изменение отступов по нужной оси, в нужном направлении
				_getMargin();								//вывести на экран
			}
		}

	///////////////////////////
	//действия с ватермаркой //
	///////////////////////////

		/**
		 * Перемещение ватермарки после нажатия на стрелочки
		 * @param  {[string]} axis Ось, по которой перемещать вотремарку, принимает "X" или "Y"
		 * @param  {[string]} dir  Направление, принимает "UP" - в сторону увеличения, "DOWN" - в сторону уменьшения
		 */
		function _changeCoordinates (axis, dir) {
			//e.preventDefault();

			var xEnd 	= _bgWidth - _wmWidth, 			// крайняя позиция X
				yEnd 	= _bgHeight - _wmHeight, 		// крайняя позиция Y
				innerX  = _getCoordinates().x,				// текущая X координата ватермарки
				innerY  = _getCoordinates().y,				// текущая Y координата ватермарки
				step 	= 5;								// шаг сдвига ватермарки, в пикселях

			if (axis === 'X') {
				if (dir === 'UP') {
					if(_checkBorders(innerX, xEnd)) { 				//проверка границ, текущей координаты innerX в пределах xEnd
						_moveWatermark(innerX, step, 'left');		//сдвинуть ватермарку, с координаты innerX на величину step по оси X
					} else {
						_moveWatermark(0, 0, 'left');			//если вылазит за границу, то сбросить на начала экрана - сдвигать с координаты 0.
					}		
				} else if (dir === 'DOWN') {
					if(_checkBorders(innerX, xEnd)) {
						_moveWatermark(innerX, -step, 'left');
					} else {
						_moveWatermark(xEnd , 0, 'left');	
					}
				}
			} else if (axis === 'Y') {
				if (dir === 'UP') {
					if(_checkBorders(innerY, yEnd)) {
						_moveWatermark(innerY, step, 'top');
					} else {
						_moveWatermark(0, 0, 'top');	
					}
				} else if (dir === 'DOWN') {
					if(_checkBorders(innerY, yEnd)) {
						_moveWatermark(innerY, -step, 'top');
					} else {
						_moveWatermark(yEnd , 0, 'top');
					}
				}
			}

			/**
			 * Проверка выходит ли ватермарка за границы фонового изображения
			 * @param  {number} value 	значение текущей координаты
			 * @param  {number} end   	верхний предел границы
			 * @return {bool}   true	если текущая координата в пределах границы
			 */
			function _checkBorders (value, end) {
				if ((value >= 0 ) && (value <= end)) {
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
		} // end _changeCoordinates()

		/**
		 * Увеличение отступов между ватермарками после нажатия на стрелочки
		 * @param  {[string]} axis Ось, по которой перемещать вотремарку, принимает "X" или "Y"
		 * @param  {[string]} dir  Направление, принимает "UP" - в сторону увеличения, "DOWN" - в сторону уменьшения
		 */
		function _changeMargin(axis, dir){
			var	_verticLineWidth = _verticLine.width(),   // ширина вртик. линии
				_horizLineHeight = _horizLine.height(),   // высота горизонт. линии
				_parentWidth = _lineParent.width(),       // ширина обертки миниатюры
				_parentHeight = _lineParent.height(),     // высота обертки миниатюры
				_stepChange = 1,                          // шаг для изменения ширины и высоты линий
				_newLineWidth,                            // измененная ширина вертик. линии
				_newLineHeight,                           // измененная высота горизонт. линии
				_innerLeft,                               // центрирование вертик. линии после изменения ширины
				_innerTop,                                // центрирование горизонт. линии после изменения высоты
				_wmImgs = $('.window__bg img');           // набор ватермарков

			if (axis === 'Y') {
				if (dir === 'UP') {
					// изменнение высоты гориз. линии на 1px
					_newLineHeight = _horizLineHeight + _stepChange;
					// центрирование гориз. линии относительно родителя
					_innerTop = (_parentHeight - _newLineHeight)/2;

					_wmImgs.css({'margin-bottom': _newLineHeight});
					
					if(_newLineHeight < _parentHeight){
						_horizLine.css({
							height : _newLineHeight,
							top : _innerTop
						});
					}
				} else if (dir === 'DOWN') {
					_newLineHeight = _horizLineHeight - _stepChange;
					_innerTop = (_parentHeight - _newLineHeight)/2;

					_wmImgs.css({'margin-bottom': _newLineHeight});
					
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
			} else {
				if (axis === 'X') {
					if (dir === 'UP') {
						_newLineWidth = _verticLineWidth + _stepChange;
						_innerLeft = (_parentWidth - _newLineWidth)/2;

						_wmImgs.css({'margin-right': _newLineWidth});
						
						if(_newLineWidth < _parentWidth) {
							_verticLine.css({
								width: _newLineWidth,
								left: _innerLeft
							});
						}
					} else if (dir === 'DOWN') {
						_newLineWidth = _verticLineWidth - _stepChange;
						_innerLeft = (_parentWidth - _newLineWidth)/2;

						_wmImgs.css({'margin-right': _newLineWidth});
						
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
				}
			}
			_getMargin();
		}

		/*отобразить одну ватермарку*/
		function _oneWatermark () {
			var currentSrcWM  = _wmWindow.find('img:eq(0)').attr('src'),
				currentWidthWM = _wmWindow.find('img:eq(0)').width(),
				currentHeightWM = _wmWindow.find('img:eq(0)').height();

			if (_wmWindow.hasClass('window__wm_one')) return;

			_wmWindow
				.empty()
				.removeClass('window__wm_tile')
				.addClass('window__wm_one')
				.css(_currentDataWM);

			_wmImg
				.attr('src', currentSrcWM)
				.css({
					'width': currentWidthWM,
					'height': currentHeightWM
				})
				.appendTo(_wmWindow);

			_draggableInit(); // инициируем перетаскивание по-дефолту
			_switchSingleSettings();
		}

		/*замостить ватермарку*/
		function _tileWatermark () {
			var widthWMTile = MAX_WIDTH_TILE_WM - (MAX_WIDTH_TILE_WM % _wmWidth), // обрезаем лишнюю ширину у контейнера
				heightWMTlie = MAX_HEIGHT_TILE_WM - (MAX_HEIGHT_TILE_WM % _wmHeight), // обрезаем лишнюю высоту у контейнера
				countWM = Math.round((widthWMTile*heightWMTlie) / (_wmWidth*_wmHeight)), // считаем кол-во ватермарков, необходимое для заполнения контейнера
				htmlWM = '',
				i = 0,
				marginRightWM = 0 || parseInt($('.window__wm img:eq(0)').css('margin-right')),
				marginBottomWM = 0 || parseInt($('.window__wm img:eq(0)').css('margin-bottom'));

			if (_wmWindow.hasClass('window__wm_tile')) return;

			// сохраняем текущую позицию и размер WM для режима Single
			_currentDataWM = {
				'width': _wmWidth,
				'height': _wmHeight,
				'top': _wmWindow.css('top'),
				'left': _wmWindow.css('left')
			};

			_wmWindow
				.find('img').css({'width': _wmWidth, 'height': _wmHeight})
				.end()
				.removeClass('window__wm_one')
				.addClass('window__wm_tile')
				.css({
					'width': widthWMTile,
					'height': heightWMTlie,
					'left': '-'+MAX_WIDTH_BG+'px',
					'top': '-'+MAX_HEIGHT_BG+'px'
				});

			while (i < countWM-1) {
				htmlWM += _wmWindow.html();
				i++;
			}

			_wmWindow.append(htmlWM);
			_draggableInit('free'); // инициируем перетаскивание без ограничений
			_switchMultiSettings();
		}

	////////////////////////////
	//вспомогательные функции //
	////////////////////////////

		/*Получить текущие координаты элемента и вывести их на экран, по умолчанию элемент - это контейнер с ватермаркой*/
		function _getCoordinates (element) {
			//вычисление координат относительно начала фоновой картинки
			var posX, posY;

			if (typeof element === 'undefined') {
				element = _wmWindow;
			}

			posX = parseInt(element.offset().left - _bgWindow.offset().left);
			posY = parseInt(element.offset().top - _bgWindow.offset().top);

			_xInput.val(posX); //вывод координаты в поле X
			_yInput.val(posY);

			return {
				x: posX,
				y: posY
			};
		} //end _getCoordinates()

		/*Получить текущие отступы и вывести их на экран*/
		function _getMargin() {
			var horizLineHeight = _horizLine.height(),     // высота горизонт. линии
				verticLineWidth = _verticLine.width();     // ширина вертик. линии

			if (_switchMode === 'multi') {
				_yInput.val(parseInt(horizLineHeight));    // вывод высоты горизонтальной линии
				_xInput.val(parseInt(verticLineWidth));    // вывод ширины вертикальной линии
			}
		}

		/*Получить текущие параметры изображений. Необходима для обновления значений при различных событиях*/
		function _getParametrs() {
			var 
				wmArray = $('.wm-img'),
				coordinatesArray = [],
				innerX = 0,
				innerY = 0;

			//получение размеров изображений
			_bgWidth    = _bgWindow.width();
			_bgHeight   = _bgWindow.height();
			_wmWidth	= _wmWindow.width();
			_wmHeight	= _wmWindow.height();

			_bgWidthValue.val(_bgWidth);
			_bgHeightValue.val(_bgHeight);

			//получение массива с координатами ватермарок и запись его в скрытый инпут
			wmArray.each(function(index, el) {
				innerX = _getCoordinates($(el)).x;
				innerY = _getCoordinates($(el)).y;
			
				coordinatesArray[index]=[innerX, innerY];
			});
			_coordinatesValue.val(coordinatesArray); //запись массива в скрытый инпут, для передачи в php
		}

	///////////
	//кнопки //
	///////////
		function _resetApp () {
			_switchSingleSettings();
			_squares.eq(0).trigger('click');
			_opacitySliderInit ();
			_changeOpacity(OPACITY_DEFAULT);
		}

		function _submitApp (e) {
			e.preventDefault();

			$.when(_getParametrs(), _getMargin())
				.then(function () {
					_form.trigger('submit');
				});
		}

		return {
			init: function () {
				_setUpListeners();
				_checkDisabled();
				_fileUpload ();
				_draggableInit ();
				_opacitySliderInit ();
			}
		};

	}());

	wmGeneratorApp.init();

});