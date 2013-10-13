var ProgressBar = (function ($) { "use strict";
	var ProgressBar = function() {
		this.$el = $('<div class="progress completed progress-striped active" id="progress"><div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"><span class="sr-only">0% Complete</span></div></div>').appendTo("#progress-bar-wrap");
	}
	ProgressBar.prototype.update = function(progress) {
		if((!isNaN(parseFloat(progress)) && isFinite(progress))){
			var progressAmount = progress,
				$progress = this.$el,
				$progressBar = $progress.find(".progress-bar"),
				$progressText = $progressBar.find("span");
			if($progress.hasClass("completed")){$progress.removeClass("completed")}
			$progress.css("display","block;");
			$progressBar.attr("aria-valuenow", progressAmount);
			$progressBar.css("width", progressAmount+"%");
			$progressText.text(progressAmount+"% Complete");
			if(progressAmount >= 100){
				this.update(0);
				$progress.addClass("completed");
			}
		}
	}
	return ProgressBar;
})(jQuery);
