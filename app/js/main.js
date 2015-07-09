jQuery(document).ready(function($) {
	
/*Стилизованный input=file*/
		// отслеживаем изменение инпута file
	$('#bg-file').change(function(){
		// Если файл прикрепили то заносим значение value в переменную
		var $this = $(this),
			fileResult = $this.val(),
			inputText = $this.parent().find('.file-load__wrapper').find('input');
			console.log(fileResult);
			console.log(inputText);
		// И дальше передаем значение в инпут, который под загрузчиком
				inputText.val(fileResult);
	});



//После добавления ответа от сервера
/*
	$(function () {
	    'use strict';
	    // Change this to the location of your server-side upload handler:
	    var url = './php/upload.php';
	    $('#file').fileupload({
	        url: url,
	        dataType: 'json',
	        success: function (data) {
	           $('#project-img-path').val(data.name);
	           console.log(data.name);
	        }
	    })
	});*/

});