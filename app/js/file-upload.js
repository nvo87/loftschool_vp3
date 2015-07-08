;var fileUpload = (function(){

	var wrapper = $('.field-file-upload'),
		input = wrapper.find('input'),
		fakeInput = wrapper.find('.fake-input-text'),
		fileAPI = (window.File && window.FileReader && window.FileList && window.Blob) ? true : false;

	return {
		init: function(){
			this.setupListeners();
		},
		setupListeners: function(){
			input.on('change', getFileName);
		}
	};

	function getFileName(e){
		e.preventDefault();
		var fileName;
		if (fileAPI && input[0].files[0]) {
			fileName = input[0].files[0].name;
		} else {
			fileName = input.val().replace('C:\\fakepath\\', '');
		}
		if (!fileName.length)
			return;
		fakeInput.text(fileName);
	}

})();