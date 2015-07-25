<?php 
	
	session_start();
	$langs = array("ru","en");
	$default_lang = "ru";

	if(@$_SESSION['now_lang']) {
	// Проверяем если выбранный язык доступен для выбора
		if(!in_array($_SESSION['now_lang'], $langs)) {
		// Неправильный выбор, возвращаем язык по умолчанию
			$_SESSION['now_lang'] = $default_lang;
		}
	}
	else {
		$_SESSION['now_lang'] = $default_lang;
	}

	// Выбранный язык отправлен скрипту через GET
	$language = addslashes($_GET['lang']);
	if($language) {
		// Проверяем если выбранный язык доступен для выбора
		if(!in_array($language, $langs)) {
			// Неправильный выбор, возвращаем язык по умолчанию
			$_SESSION['now_lang'] = $default_lang;
		}
		else {
			// Сохраняем язык в сессии
			$_SESSION['now_lang'] = $language;
		}
	}
	// Открываем текущий язык
	$current_lang = addslashes($_SESSION['now_lang']);
	include_once ("php/language/".$current_lang.".php");

?>


<!DOCTYPE html>
<html lang="ru-RU">

	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<title><?php echo $lang['title_text'] ?></title>
		<meta name="description" content="group2_vp3-loftSchool">
		<meta name="keywords" content="group2_vp3-loftSchool">
		<meta name="author" content="group2_vp3-loftSchool">
		<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
		<link rel="icon" href="/favicon.ico" type="image/x-icon">
		<!-- build:css css/vendor.min.css -->
		<!-- bower:css-->
		<link rel="stylesheet" href="bower/normalize.css/normalize.css" />
		<!-- endbower -->
		<!-- endbuild -->
		<!-- build:css fonts/fonts.min.css -->
		<link rel="stylesheet" href="fonts/font.css">
		<!-- endbuild -->
		<!-- build:css css/main.min.css -->
		<link rel="stylesheet" href="css/main.css">
		<link rel="stylesheet" href="css/slider.css">
		<!-- endbuild -->
		<!-- build:js js/modernizr.min.js -->
		<script src="bower/modernizer/modernizr.js"></script>
		<!-- endbuild -->
	</head>

	<body>
			<!--[if lt IE 7]>
	<p class="browsehappy">Вы используете <strong>устаревший</strong> браузер. Пожалуйста <a href="http://browsehappy.com/">обновите</a> его.</p>
	<![endif]-->
	<div class="wrapper">
		<div class="wm-generator clearfix">
			<div class="wm-generator__main">
				<h1 class="main__title"><?php echo $lang['title_h1_text'] ?></h1>
				<p class="error-msg"></p>
				<!--main-window--> 
				<div class="main__window clearfix">
					<div class="window__bg">
							<div class="window__wm">
							</div>
					</div>
				</div>
			</div>

			<!--settings--> 
			<div class="wm-generator__settings">
				<h2 class="settings__title"><?php echo $lang['settings_text'] ?></h2>
				<form action="php/download.php" method="post" enctype="multipart/form-data" id="form">

				<!--upload-->
					<div class="settings__group separate-line">
						<div class="settings__upload">
							<div class="file-load">
								<input type="hidden" name="bg-width" id="bg-width-value">
								<input type="hidden" name="bg-height" id="bg-height-value">
								<label class="label"><?php echo $lang['bg_image_text'] ?></label>
								<div class="file-load__block">
									<input class="file-load__input-text" type="text" placeholder="<?php echo $lang['input_image_text'] ?>" id="bg-img-path" name="bg-img-path" value=""  data-tooltip="Вы не выбрали изображение">
									<button class="file-load__btn"></button>
									<input type="file" value="" id="bg-file" name="files[]" class="file-load__input-file btn">
								</div>
							</div>
							<div class="file-load">
							<div class="disable"></div>
								<label class="label"><?php echo $lang['wm_image_text'] ?></label>
								<div class="file-load__block">
									<input class="file-load__input-text" type="text" placeholder="<?php echo $lang['input_image_text'] ?>" id="wm-img-path" name="wm-img-path" value="" data-tooltip="Вы не выбрали изображение">
									<button class="file-load__btn"></button>
									<input type="file" value="" id="wm-file" name="files[]" class="file-load__input-file btn">
								</div>
							</div>
						 </div>
					</div>

					<!--position-->
					<div class="settings__group separate-line">
						<div class="settings__position clearfix">
							<div class="position__header clearfix">
								<h3 class="label"><?php echo $lang['position_text'] ?></h3>
								<input type="hidden" name="coordinates" id="wm-coords" value="">
								<div class="position__switch">
									<div class="switch switch__multi">multi</div>
									<div class="switch switch__single switch--active">single</div>
							 </div>
							</div>
							<div class="position__body">
								<div class="position__square-wrap">
									 <div class="position__square">
										<div class="square-tr">
											<div class="square-td square-td--active" data-pos-x="left" data-pos-y="top"></div>
											<div class="square-td" data-pos-x="center" data-pos-y="top"></div>
											<div class="square-td" data-pos-x="right" data-pos-y="top"></div>
										</div>
										<div class="square-tr">
											<div class="square-td" data-pos-x="left" data-pos-y="center"></div>
											<div class="square-td" data-pos-x="center" data-pos-y="center"></div>
											<div class="square-td" data-pos-x="right" data-pos-y="center"></div>
										</div>
										<div class="square-tr">
											<div class="square-td" data-pos-x="left" data-pos-y="bottom"></div>
											<div class="square-td" data-pos-x="center" data-pos-y="bottom"></div>
											<div class="square-td" data-pos-x="right" data-pos-y="bottom"></div>
										</div>
										<div class="multi-line line-vertical"></div>
										<div class="multi-line line-horizontal"></div>
									</div>
								</div>

								<div class="position__coordinates">
									<div class="coordinates__block clearfix">
										<div class="coordinates__axis x-singl"></div>
										<div class="coordinates__input-wrap">
											<input type="text" name="x-axis" value="0" class="coordinates__input " id="x-axis" disabled>
										</div>
										<div class="coordinates__arrows">
											<a href="#" class="coordinates_arrows coordinates__arrows-up x-arrows-up" data-axis="X" data-dir="UP"></a>
											<a href="#" class="coordinates_arrows coordinates__arrows-down x-arrows-down" data-axis="X" data-dir="DOWN"></a>
										</div>
									</div>
									<div class="coordinates__block  clearfix">
										<div class="coordinates__axis y-singl"></div>
										<div class="coordinates__input-wrap">
											<input type="text" name="y-axis" value="0" class="coordinates__input" id="y-axis" disabled>
										</div>
										<div class="coordinates__arrows">
											<a href="#" class="coordinates_arrows coordinates__arrows-up y-arrows-up" data-axis="Y" data-dir="UP"></a>
											<a href="#" class="coordinates_arrows coordinates__arrows-down y-arrows-down" data-axis="Y" data-dir="DOWN"></a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!--transparency-->
					<div class="settings__group separate-line">
						<div class="settings__transparency">
							<h3 class="label"><?php echo $lang['transparency_text'] ?></h3>
							<div class="transparency__slider">
								<span class="transparency__point ui-slider-handle ui-state-default ui-corner-all"></span>
								<input type="hidden" class="transparency__input--hidden" name="transparency" value="1">
							</div>
						</div>
					</div>

						
					<!--buttons-->
					<div class="settings__group">
						<div class="settings__buttons">
							<button type="reset" class="btn-reset"><?php echo $lang['reset_text'] ?></button>
							<button type="submit" class="btn-submit"><?php echo $lang['download_text'] ?></button>
						</div>
					</div>

				</form>
			</div> 
		</div>
		 
		<!--side-menu-->   
		<div class="side-menu">
			<ul class="side-menu__languages">
				<li class="languages__item-ru"><a class="languages__link" href="index.php?lang=ru">рус</a></li>
				<li class="languages__item-en"><a class="languages__link" href="index.php?lang=en">eng</a></li>
			</ul>
			<ul class="side-menu__social">
				<li class="social__item-like">
					<a href="" class="social__link" >share<span class="social__icon icon-like"></span></a>
				</li>
				<li class="social__item-fb">
					<a class="social__link" id="fb" href="">facebook<span class="social__icon icon-fb"></span></a>
				</li>
				<li class="social__item-tw">
					<a class="social__link" id="tw" href="">twitter<span class="social__icon icon-tw"></span></a>
				</li>
				<li class="social__item-vk">
					<a class="social__link" id="vk" href="">vkontakte<span class="social__icon icon-vk"></span></a>
				</li>
			</ul>
		</div>

		<!--footer--> 
		<footer class="page-footer">
			<p class="page-footer__text">© 2015. <?php echo $lang['copyright_text'] ?></p>
		</footer>

		<!-- build:js js/vendor.js -->
		<!--bower:js-->
		<script src="bower/jquery/dist/jquery.js"></script>
		<script src="bower/jquery-ui/jquery-ui.js"></script>
		<script src="bower/jquery-ui/ui/slider.js"></script>
		<script src="bower/jquery-ui/ui/position.js"></script>
		<script src="bower/blueimp-file-upload/js/jquery.fileupload.js"></script>
		<script src="bower/blueimp-file-upload/js/vendor/jquery.ui.widget.js"></script>
		<script src="bower/blueimp-file-upload/js/jquery.iframe-transport.js"></script>
		<!--endbower  -->
		<!-- endbuild -->
		<!-- build:js js/main.js -->
		<script src="js/plugins.js"></script>
		<script src="js/main.js"></script>
		<!-- <script src="js/file-upload.js"></script> -->
		<!-- <script src="js/disable.js"></script> -->
		<!-- <script src="js/switch.js"></script> -->
		<!-- <script src="js/watermark.js"></script> -->
		<!-- <script src="js/coordinates.js"></script> -->
		<!-- <script src="js/watermark-opacity.js"></script> -->
		<!-- endbuild -->
	</body>
</html>