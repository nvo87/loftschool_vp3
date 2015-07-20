<?php 
	require 'vendor/autoload.php';	
	use PHPImageWorkshop\ImageWorkshop;

	$path='../img/upload/';
	$result_name='result.jpg';
	$result_file=$path.$result_name;
	$ctype="image/jpg";
	$quality=95;

	$bg_image = $path.$_POST['bg-img-path'];		//получение картинки
	$wm_image = $path.$_POST['wm-img-path'];

	//Получение реального размера картинки
	$bg_size = getimagesize($bg_image);
	$bg_width = $bg_size[0];					//истинные размеры фона
	$bg_height = $bg_size[1];

	$bg_width_scale = $_POST['bg-width'];
	$bg_height_scale = $_POST['bg-height'];

	// Получение координат ватермарки
	$coordinates_array = $_POST['coordinates'];
	$coordinates_array = explode(',', $coordinates_array);
	$wm_position="LT";     //стартовый угол для отсчета координат

	//создание слоя
	$bg_layer = ImageWorkshop::initFromPath($bg_image);		
	$wm_layer = ImageWorkshop::initFromPath($wm_image);

	// Прозрачность для водяного знака
	$wm_opacity=$_POST['transparency']*100; //в процентах
	$wm_layer->opacity($wm_opacity);

	//Цикл наложения всех ватермарок на фон
	$length = count($coordinates_array);
	for ($i=0; $i < $length; $i=$i+2) { 
		$wm_positionX=$coordinates_array[$i];
		$wm_positionY=$coordinates_array[$i+1];

		$k_x = $bg_width / $bg_width_scale; // Считаем коэффициент сдвига .650 - ширина окна. Вывести сюда данные через js
		$k_y = $bg_height / $bg_height_scale; // Считаем коэффициент сдвига .535 - высота окна. Вывести сюда данные через js
		$wm_positionX_real = $k_x * $wm_positionX;
		$wm_positionY_real = $k_y * $wm_positionY;


		/**
		 * Наложение слоя $wm_layer поверх слоя $bg_layer
		 * @param ImageWorkshop $layer - накладываемый слой
		 * @param integer $positionX   - координата по оси X
		 * @param integer $positionY   - координата по оси Y
		 * @param string $position     - начальная тока отсчета координат (LT, MT, RT, LM, MM и т.д.)
		 * $mainLayer->addLayerOnTop($layer, $positionX, $positionY, $position);
		 */
		$bg_layer->addLayerOnTop($wm_layer, $wm_positionX_real, $wm_positionY_real, $wm_position);
	}

	// Сохранение готового изображения (если требуется)
	$bg_layer->save($path, $result_name, true, null, $quality);

	// Если требуется показать созданное изображение в браузере
	/*$image = $bg_layer->getResult();
	header('Content-type: image/jpeg');
	header('Content-Disposition: filename="result.jpg"');
	imagejpeg($image, null, $quality);
	exit;*/

	//отдаем файл на скачивание
	header('Content-Description: File Transfer');
	header('Content-Type: application/octet-stream');
	header('Content-Disposition: attachment; filename=' . basename($result_file));
	header('Content-Transfer-Encoding: binary');
	header('Expires: 0');
	header('Cache-Control: must-revalidate');
	header('Pragma: public');
	header('Content-Length: ' . filesize($result_file));
	readfile($result_file);
	exit;
 ?>