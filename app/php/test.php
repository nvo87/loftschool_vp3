<?php 

$coordinates_array = $_POST['coordinates'];

$length = count($coordinates_array);

$coordinate = $coordinates_array[0][0];
$path='../img/upload/';
$bg_image = $path.$_POST['bgImgPath'];				//получение картинки
$wm_image = $path.$_POST['wmImgPath'];
$wm_opacity=$_POST['opacity']*100; //в процентах
$coordinates_array = $_POST['coordinates'];


echo $bg_image;


 ?>