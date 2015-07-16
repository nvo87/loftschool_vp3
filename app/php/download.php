<?php 
require 'vendor/autoload.php';	
use PHPImageWorkshop\ImageWorkshop;

$path='../img/upload/';
$result_name='result.jpg';
$result_file=$path.$result_name;
$ctype="image/jpg";
$quality=95;


$switch_mode = $_POST['switch_mode'];					//режим работы - одиночная или замостить. Приходит - single или multi
$bg_image = $path.$_POST['bg-img-path'];				//получение картинки
$wm_image = $path.$_POST['wm-img-path'];
$wm_opacity=$_POST['transparency']*100; //в процентах
$wm_positionX = $_POST['x-axis'];
$wm_positionY = $_POST['y-axis'];
$wm_position="LT";

//создание слоя
$bg_layer = ImageWorkshop::initFromPath($bg_image);		
$wm_layer = ImageWorkshop::initFromPath($wm_image);

//Пересчет позиции ватермарки с учетом реального размера картинки
$bg_size = getimagesize($bg_image);
$bg_width = $bg_size[0];
$bg_height = $bg_size[1];

$k_x = $bg_width / 650; // Считаем коэффициент сдвига .650 - ширина окна. Вывести сюда данные через js
$k_y = $bg_height / 535; // Считаем коэффициент сдвига .535 - высота окна. Вывести сюда данные через js
$wm_positionX_real = $k_x * $wm_positionX;
$wm_positionY_real = $k_y * $wm_positionY;

// Прозрачность для водяного знака
$wm_layer->opacity($wm_opacity);

/**
 * Наложение слоя $wm_layer поверх слоя $bg_layer
 * @param ImageWorkshop $layer - накладываемый слой
 * @param integer $positionX   - координата по оси X
 * @param integer $positionY   - координата по оси Y
 * @param string $position     - начальная тока отсчета координат (LT, MT, RT, LM, MM и т.д.)
 * $mainLayer->addLayerOnTop($layer, $positionX, $positionY, $position);
 */

$bg_layer->addLayerOnTop($wm_layer, $wm_positionX_real, $wm_positionY_real, $wm_position);

/**
 * Сохраняет изображение по указанному пути
 * @param string $folder            - директория для сохраняемого изображения
 * @param string $imageName         - имя файла
 * @param boolean $createFolders    - создание папок, если таковых нет
 * @param string $backgroundColor   - цвет фона
 * @param integer $imageQuality     - качество изображения
 * $mainLayer->save($folder, $imageName, $createFolders, $backgroundColor, $imageQuality);
 */

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