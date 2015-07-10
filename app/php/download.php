<?php 
require 'vendor/autoload.php';	
use PHPImageWorkshop\ImageWorkshop;

$path='../img/';
$result_name='result.jpg';
$result_file='../img/'.$result_name;
$ctype="image/jpg";
$quality=95;

$bg_layer = ImageWorkshop::initFromPath($path.'bg.jpg');
$wm_layer = ImageWorkshop::initFromPath($path.'wm.jpg');

$wm_positionX = 0;
$wm_positionY = 0;
$wm_position="LT";
$wm_opacity=50; //в процентах

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

$bg_layer->addLayerOnTop($wm_layer, $wm_positionX, $wm_positionY, $wm_position);

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