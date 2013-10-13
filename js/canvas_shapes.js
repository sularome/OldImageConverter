function DrawCanvasShape(canvasContext, type, args){
	switch(type){
		case 'diamond':
					var radius = args.r,
						x = args.x,
						y = args.y,
						l = args.l;
					canvasContext.beginPath();
					canvasContext.moveTo(x, y - l + 3);
					canvasContext.lineTo(x + (l*0.5), y);
					canvasContext.lineTo(x, y + l - 3);
					canvasContext.lineTo(x - (l*0.5), y);
					canvasContext.lineTo(x, y - l + 3);
					canvasContext.closePath();

					canvasContext.fillStyle = args.imageColor; 
					canvasContext.fill(); 
			break;
		case 'rectangle':
				var x = args.x - Math.ceil(args.l/2),
					y = args.y - Math.ceil(args.l/2),
					l = args.l,
					width = args.l,
					height = args.l;
				canvasContext.rect(x, y, width, width);
				canvasContext.fillStyle = args.imageColor;
				canvasContext.fill();
			break;
		case 'rounded rectangle':
					var radius = Math.ceil(args.l/4),
						x = args.x - Math.ceil(args.l/2),
						y = args.y - Math.ceil(args.l/2),
						l = args.l,
						width = args.l,
						height = args.l;
					canvasContext.beginPath();
					canvasContext.moveTo(x + radius, y);
					canvasContext.lineTo(x + width - radius, y);
					canvasContext.quadraticCurveTo(x + width, y, x + width, y + radius);
					canvasContext.lineTo(x + width, y + height - radius);
					canvasContext.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
					canvasContext.lineTo(x + radius, y + height);
					canvasContext.quadraticCurveTo(x, y + height, x, y + height - radius);
					canvasContext.lineTo(x, y + radius);
					canvasContext.quadraticCurveTo(x, y, x + radius, y);
					canvasContext.closePath();

					canvasContext.fillStyle = args.imageColor; 
					canvasContext.fill(); 
			break;
		default :
				canvasContext.arc(args.x, args.y, args.r, 0, 2*Math.PI);
				canvasContext.fillStyle = args.imageColor;
				canvasContext.fill();
			break;
	}
}