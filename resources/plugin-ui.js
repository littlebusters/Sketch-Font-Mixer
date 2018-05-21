import pluginCall from 'sketch-module-web-view/client'

// Disable the context menu to have a more native feel
document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
});

// document.getElementById('button').addEventListener('click', function () {
//   pluginCall('nativeLog', 'Called from the webview')
// })

// called from the plugin
// window.setRandomNumber = function (randomNumber) {
//   document.getElementById('answer').innerHTML = 'Random number from the plugin: ' + randomNumber + '!!';
// }
function sendLog (msg) {
	pluginCall('sendLog', msg);
}

window.appendOriginalFontName = function (fontName) {
	pluginCall('sendLog', 'Run: appendOriginalFontName');
	pluginCall('sendLog', fontName);
	// var nodeContent = document.createTextNode(fontName);
	// document.getElementById('orgFont').textContent = fontName;
	// document.getElementById('orgFont').appendChild(nodeContent);
	document.getElementById('orgFont').innerHTML = fontName;
}
window.appendReplacementFontName = function (fontName) {
	pluginCall('sendLog', fontName);
	var repFont = document.getElementById('repFont');
	repFont.removeChild(document.getElementById('fontlist'));
	repFont.textContent = fontName;
}
window.createFontList = function (rawFonts) {
	var select = document.getElementById('fontlist');
	var dividerPosition = 0;
	
	for (var i = 0; i < rawFonts.length; i++) {
		if (null == rawFonts[i]) {
			dividerPosition = i + 1;
			break;
		}
	}

	var fontList = rawFonts.slice(dividerPosition, rawFonts.length);

	for (var i = 0; i < fontList.length; i++) {
		var option = document.createElement('option')
				option.setAttribute('value', fontList[i]);
		var label = document.createTextNode(fontList[i]);
		option.appendChild(label);
		select.appendChild(option);
	}

}

window.sendMixingSetting = function () {
	var targetStrings = document.targetString;
	for (var i = targetStrings.length - 1; i >= 0; i--) {
		targetStrings[i];
	}
}

document.getElementById('mixing').addEventListener('click', function () {
	var selectFont = document.getElementById('fontlist');
	var targetStringState = document.getElementsByName('targetString');
	var targetStrings = {};
	for (var i = targetStringState.length - 1; i >= 0; i--) {
		if (true == targetStringState[i].checked) {
			targetStrings[targetStringState[i].value] = true;
		}
	}

	var customString = document.getElementById('customString').value;

	// document.getElementById('logs').innerHTML = targetStrings.toString();
  pluginCall('pushMixing', selectFont.value, targetStrings, customString);
  // window.close();
})