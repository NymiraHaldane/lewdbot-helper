var elem = document.createElement('link');
elem.rel = 'stylesheet';
elem.setAttribute('href', 'https://fonts.googleapis.com/css?family=Open+Sans');
document.head.appendChild(elem);
delay(500).then(function() {
	var init = document.createElement('p');
	init.innerText = '&nbsp';
	init.setAttribute('style', 'font-family: "Open Sans"')
	document.body.appendChild(init);
})

function delay(delay) {
  return new Promise(function(resolve) {
		console.log(Date.now());
    setTimeout(resolve, delay);
  });
}

chrome.storage.onChanged.addListener(function(e) {
	console.log({e});
	switch (e.alert.newValue) {
		case "small-image":
			$.notify({
			message: 'Sending Image...'
			},{
			type: 'info',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-info").animate({opacity: 0}, 500);
			});
			break;
		case "big-image":
			$.notify({
			message: 'Telegram doesn\'t support images over 10MB'
			},{
			type: 'danger',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-danger").animate({opacity: 0}, 500);
			});
			break;
		case "webm":
			$.notify({
			message: 'Converting WEBM to MP4...'
			},{
			type: 'info',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-info").animate({opacity: 0}, 500);
			});
			break;
		case "unrecognized":
			$.notify({
			message: 'Attempting to send unrecognized file type...'
			},{
			type: 'warning',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-warning").animate({opacity: 0}, 500);
			});
			break;
		case "image-sent":
			$.notify({
			message: 'Image sent!'
			},{
			type: 'success',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-success").animate({opacity: 0}, 500);
			});
			break;
		case "conversion-finished":
			$.notify({
			message: 'Conversion completed!'
			},{
			type: 'success',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-success").animate({opacity: 0}, 500);
			});
			break;
		case "image-file-failed":
			$.notify({
			message: 'Telegram\'s API refused this image.'
			},{
			type: 'danger',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-danger").animate({opacity: 0}, 500);
			});
			break;
		case "image-compress-failed":
			$.notify({
			message: 'Failed to compress image.'
			},{
			type: 'danger',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-danger").animate({opacity: 0}, 500);
			});
			break;
		case "sending-webm":
			$.notify({
			message: 'Sending converted WEBM...'
			},{
			type: 'info',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-info").animate({opacity: 0}, 500);
			});
			break;
		case "webm-sent":
			$.notify({
			message: 'WEBM sent!'
			},{
			type: 'success',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-success").animate({opacity: 0}, 500);
			});
			break;
		case "image-file":
			$.notify({
			message: 'Telegram failed to get image from URL, retrieving image file...'
			},{
			type: 'info',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-info").animate({opacity: 0}, 500);
			});
			break;
		case "sending-video":
			$.notify({
			message: 'Sending GIF/MP4...'
			},{
			type: 'info',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-info").animate({opacity: 0}, 500);
			});
			break;
		case "video-sent":
			$.notify({
			message: 'GIF/MP4 sent!'
			},{
			type: 'success',
			delay: 3000
			});
			delay(2500).then(function() {
				$(".alert-success").animate({opacity: 0}, 500);
			});
			break;
	}
});
