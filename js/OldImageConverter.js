var OldImageConverter  = (function ($) { "use strict";
	var OldImageConverter = function () {
		this.dataCache		= "marilyn_monroe.jpg",
		this.segmentSize	=
		this.segmentColor	=
		this.shape			=
		this.colorFunc 		= null,
		this.isProcessing 	= false,
		this.worker 		= new Worker('js/worker.js'),
		this.events = {};
		this.init();
	}
	OldImageConverter.prototype.init = function() {
		this.worker.addEventListener('message', $.proxy(this.workerListener, this), false);
		
		// Setup the dnd listeners.
		var dropZone = document.getElementById('drop_zone');
		dropZone.addEventListener('dragenter', $.proxy(this.handleDragEnter, this, $(dropZone)), false);
		dropZone.addEventListener('dragleave', $.proxy(this.handleDragleave, this, $(dropZone)), false);
		dropZone.addEventListener('dragover', $.proxy(this.handleDragOver, this, $(dropZone)), false);
		dropZone.addEventListener('drop', $.proxy(this.handleFileSelect, this, $(dropZone)), false);
		
		$("#image_input").change($.proxy(this.handleFileSelect, this, $(dropZone)));
		
		$('#export').click($.proxy(this.exportImage, this));
		
		$('#image_slider').change($.proxy(this.changeSettings, this));		
		$('#image_color').change($.proxy(this.changeSettings, this));		
		$('#shape_type').change($.proxy(this.changeSettings, this));		
		$('#color_type').change($.proxy(this.changeSettings, this));
		
		
		this.changeSettings();
	}
	OldImageConverter.prototype.workerListener = function(e) {
		
		var data = e.data;
		switch (data.cmd) {
			case 'draw_image_result':
				var canvas = $('#canvas').get()[0],
				canvasCtx = canvas.getContext('2d'),
				circles = data.imageData;
				canvasCtx.clearRect (0, 0, canvas.width, canvas.height);
				  
				var maxR = (this.segmentSize*Math.sqrt(2)/2);
				for(var s = 0, l = circles.length; s < l; s++){
				
					canvasCtx.beginPath();
					var r = Math.ceil(maxR*(circles[s].s/255));
					var sideLength = Math.ceil(this.segmentSize*(circles[s].s/255));
					
					DrawCanvasShape(canvasCtx, this.shape, {x : circles[s].x, y : circles[s].y, r : r, maxR : maxR, maxL : this.segmentSize, l : sideLength, imageColor : circles[s].c});
					if(s%400 == 0){
						this.on("updateProgress").publish(Math.ceil((s*100/l)*0.2 - 0 + 80));
					}
				}
				this.on("updateProgress").publish(100);
				
				
				this.isProcessing = false;
			break;
			case 'console':
				console.log(data.data);
			break;
			case 'loading_progress':
				// only 80% cause calculating is only part, there is also drawing
				this.on("updateProgress").publish(e.data.progress*0.8);			
			break;
		}
		if(e.data.msg){ 
			$("#result").text(e.data.msg);
		}

	}
	OldImageConverter.prototype.calculateData = function(_data) {
		var self = this;
		if(!this.isProcessing && _data && this.validate()){
			$('#canvas_screen_wrap #canvas').remove();
			
			this.isProcessing = true;
			var img = new Image();
			img.src = _data;
			img.onload = function(){
				var canvas = $('<canvas width="'+this.width+'" height="'+this.height+'" id="canvas" />').appendTo('#canvas_screen_wrap').get()[0],
					canvasCtx = canvas.getContext('2d');
				canvasCtx.drawImage(this, 0, 0);
				var imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
				self.worker.postMessage({'cmd': 'draw_image', 
									'width': canvas.width, 
									'height': canvas.height, 
									'imageBlockSize': self.segmentSize, 
									'data' : imageData, 
									'colorFunc' : self.colorFunc, 
									'imageColor' : self.segmentColor});
			}	
		}
	}
	OldImageConverter.prototype.validate = function() {
		var validationResult = true;
		if(!/^#[0-9A-Fa-f]{6}$/i.test(this.segmentColor)){
			validationResult = false;
			$("#image_color").addClass("error");
		}else{
			$("#image_color").removeClass("error");
		}
		if(!isNaN(parseFloat(this.segmentSize)) && isFinite(this.segmentSize)){
			$("#image_slider").removeClass("error");
		}else{
			validationResult = false;
			$("#image_slider").addClass("error");
		}
		
		return validationResult;
	}
	OldImageConverter.prototype.handleFileSelect = function($el,evt) {
		var self = this;
		evt.stopPropagation();
		evt.preventDefault();
		
		var files = evt.target.files || evt.dataTransfer.files;
		
		for (var i = 0, f; f = files[i]; i++) {
			if (!f.type.match('image.*')) {
				continue;
			}
			var reader = new FileReader();
			reader.onload = (function(theFile) {
				return function(e) {
					self.dataCache = e.target.result;
					self.calculateData(e.target.result);
				};
			})(f);
			reader.readAsDataURL(f);
		}
		$el.removeClass("over");
	}

	OldImageConverter.prototype.handleDragOver = function($el,evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy';
		$el.addClass("over");
	}
	OldImageConverter.prototype.handleDragEnter = function($el,evt) {
		evt.stopPropagation();
		evt.preventDefault(); 
		$el.addClass("over");
		return false;
	}
	OldImageConverter.prototype.handleDragleave = function($el,evt) {
		evt.stopPropagation();
		evt.preventDefault(); 
		$el.removeClass("over");
		return false;
	}
	OldImageConverter.prototype.changeSettings = function(e) {
		this.gatherSettings();
		this.calculateData(this.dataCache);
	}
	OldImageConverter.prototype.gatherSettings = function() {
		this.segmentSize = $("#image_slider").val();
		this.segmentColor = $('#image_color').val();
		this.shape = $('#shape_type').val();
		this.colorFunc = $('#color_type').val();
	}
	OldImageConverter.prototype.exportImage = function(e) {
		e.preventDefault();
		var self = this;
		if($('#canvas').length){
			$('#canvas').get()[0].toBlob(function(blob) {
				var d = new Date(),
					day = d.getDay() + 1;
				saveAs(blob, "canvas_"+self.dateToString(d)+".png");
			});
		}
	}
	OldImageConverter.prototype.pad = function(number) {
		var r = String(number);
		if (r.length === 1) {
			r = '0' + r;
		}
		return r;
	}
	OldImageConverter.prototype.dateToString = function(date) {
		return date.getUTCFullYear()
			+ '_' + this.pad(date.getUTCMonth() + 1)
			+ '_' + this.pad(date.getUTCDate())
			+ '_' + this.pad(date.getUTCHours())
			+ '_' + this.pad(date.getUTCMinutes())
			+ '_' + this.pad(date.getUTCSeconds());
	}
	OldImageConverter.prototype.on = function( id ) {
		var callbacks, method,
			event = id && this.events[ id ];

		if ( !event ) {
			callbacks = jQuery.Callbacks();
			event = {
				publish: callbacks.fire,
				subscribe: callbacks.add,
				unsubscribe: callbacks.remove
			};
			if ( id ) {
				this.events[ id ] = event;
			}
		}
		return event;
	}
	return OldImageConverter;
})(jQuery);