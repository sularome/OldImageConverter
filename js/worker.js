addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) { 
	case 'draw_image':
		 
			var imageData = data.data,
				imageBlockSize = data.imageBlockSize,
				width = data.width,
				height = data.height,
				colorFunc = data.colorFunc,
				imageColor = data.imageColor,
				_data = imageData.data;
			for(var i = 0; i < _data.length; i += 4) {
				var brightness = 0.34 * _data[i] + 0.5 * _data[i + 1] + 0.16 * _data[i + 2];
				_data[i] = brightness;
				_data[i + 1] = brightness;
				_data[i + 2] = brightness;
				
			} 
			//deal with the pixels outside the picture
			var blocksCount = {x: Math.floor(width/imageBlockSize),y: Math.floor(height/imageBlockSize)};
			
			 
			var itemNum = 0;
			var circles = [];
			for(var i = 0; i < blocksCount.x; i++) {
				for(var j = 0; j < blocksCount.y; j++) {
					var averageBrightness = [];
					for(var k = 0; k < imageBlockSize; k++) {
						for(var l = 0; l < imageBlockSize; l++) {
							itemNum = i*imageBlockSize*4 + k*4 + j*width*4*imageBlockSize  + l*width*4;
							var brightness = 0.34 * _data[itemNum] + 0.5 * _data[itemNum + 1] + 0.16 * _data[itemNum + 2];
							averageBrightness[k*imageBlockSize + l] = brightness;
							
						}
					}
					var sum = 0;
					for(var s = 0; s < averageBrightness.length; s++){
						sum += parseInt(averageBrightness[s]);
					}

					var avg = sum/averageBrightness.length;
					circles[circles.length] = {x: Math.floor(i*imageBlockSize + imageBlockSize/2) ,y: Math.floor(j*imageBlockSize + imageBlockSize/2),s: Math.floor(255 - avg),c : geColor(imageColor , colorFunc, avg)};
					
				}
				self.postMessage({cmd : 'loading_progress', progress : i*100/blocksCount.x});
			}
			self.postMessage({cmd : 'draw_image_result', imageData : circles});
		break;
	default:
		self.postMessage({msg : 'Unknown command: ' + data.msg});
	};
}, false);

function geColor(color, func, level){
	switch(func){
		case 'tint' : 
				var obj = hexToRgb(color);
				var t0 = (255-level)/255;
				obj.r = Math.floor(Math.min((t0 * obj.r) + (255 * (1 - t0)),255));
				obj.g = Math.floor(Math.min((t0 * obj.g) + (255 * (1 - t0)),255));
				obj.b = Math.floor(Math.min((t0 * obj.b) + (255 * (1 - t0)),255)); 
				return rgbToHex(obj.r,obj.g,obj.b);
			break;
		case 'random_tint' :
				var obj = hexToRgb(color);
				var t0 = Math.random();
				obj.r = Math.floor(Math.min((t0 * obj.r) + (255 * (1 - t0)),255));
				obj.g = Math.floor(Math.min((t0 * obj.g) + (255 * (1 - t0)),255));
				obj.b = Math.floor(Math.min((t0 * obj.b) + (255 * (1 - t0)),255)); 
				return rgbToHex(obj.r,obj.g,obj.b);
			break;
		case 'shade' :
				var obj = hexToRgb(color);
				var t0 = level/255;
				obj.r = Math.floor(Math.max((t0 * obj.r)),0);
				obj.g = Math.floor(Math.max((t0 * obj.g)),0);
				obj.b = Math.floor(Math.max((t0 * obj.b)),0);
				return rgbToHex(obj.r,obj.g,obj.b);
			break;
		case 'random_shade' :
				var obj = hexToRgb(color);
				var t0 = Math.random();
				obj.r = Math.floor(Math.max((t0 * obj.r)),0);
				obj.g = Math.floor(Math.max((t0 * obj.g)),0);
				obj.b = Math.floor(Math.max((t0 * obj.b)),0);
				return rgbToHex(obj.r,obj.g,obj.b);
			break;
		case 'random' :
				var obj = hexToRgb(color);
				obj.r = Math.floor(Math.random()*255);
				obj.g = Math.floor(Math.random()*255);
				obj.b = Math.floor(Math.random()*255);
				return rgbToHex(obj.r,obj.g,obj.b);
			break;
		default : return color;
			break;
	}
}
function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}