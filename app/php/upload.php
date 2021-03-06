<?php 
require_once 'functions.php';
// устанавливаем путь к папке для загрузки
$rootDir = "img/upload/";         //путь для подстановки в index.html, сделано чтобы работало когда сайт лежит не только в корне
$uploadDir = "../".$rootDir;    //путь для сохранения на сервере, относительно этого php файла
if (!is_dir($uploadDir)) {
	mkdir($uploadDir, 0700);
}
// устанавливаем валидные MYME-types
$types = array("image/gif", "image/png", "image/jpeg", "image/pjpeg", "image/x-png");
// Устанавливаем максимальный размер файла
// Получаем данные из глобального массива
$file = $_FILES['files'];
// Массив с результатами отработки скрипта
$data = array();
$file_sign = exif_imagetype($file['tmp_name'][0]);
$file_size = 2097152; // 2МБ
// если MYME-type файла не соответствует допустимому
if(!in_array($file['type'][0], $types)){
	//echo "Загружать можно только изображения (gif|png|jpg|jpeg) размером до 2МБ";
	$data['error_msg'] = "Загружать можно только изображения (gif|png|jpg|jpeg) размером до 2МБ";
	$data['url'] = '';
	echo json_encode($data);
	exit;
}
else if (!$file_sign){
	//echo "Вы загрузили некоррентное изображение";
	$data['error_msg'] = "Вы загрузили некоррентные изображения, не надо ломать нам сервер";
	$data['url'] = '';
	echo json_encode($data);
	exit;
}
// Если размер файла больше максимально допустимого
else if($file['size'][0] > $file_size){
	//echo "Файл слишком большой. Загружать можно только изображения (gif|png|jpg|jpeg) размером до 2МБ";
	$data['error_msg'] = "Файл слишком большой. Загружать можно только изображения размером до 2МБ";
	$data['url'] = '';
	echo json_encode($data);
	exit;
}
// Если ошибок нет
else if($file['error'][0] == 0){
	// получаем имя файла
	$filename = basename($file['name'][0]);
	// получаем расширение файла
	$extension = pathinfo($file['name'][0], PATHINFO_EXTENSION);
	// перемещаем файл из временной папки в  нужную
	if(move_uploaded_file($file['tmp_name'][0], $uploadDir.str2url($filename).'.'.$extension)){
		$data['msg'] = "Изображение загружено";
		$data['error_msg'] = '';
		$data['url'] = $uploadDir.str2url($filename).'.'.$extension;    //нужен для обращения к картинке и получения ее размера
		$data['rootUrl'] = $rootDir.str2url($filename).'.'.$extension;
		$data['name'] = str2url($filename).'.'.$extension;
		// получаем размеры файла
		$size = getimagesize($data['url']);
		$data['width'] = $size[0]; //ширина
		$data['height'] = $size[1]; //высота
	}
	// ошибка при перемещении файла
	else {
		echo "Возникла неизвестная ошибка при загрузке файла";
		exit;
		$data['error_msg'] = "Возникла неизвестная ошибка при загрузке файла";
		$data['url'] = '';
	}
}
// Выводим результат в JSON и завершаем в скрипт
echo json_encode($data);
exit;

 ?>