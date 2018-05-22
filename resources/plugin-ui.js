import pluginCall from 'sketch-module-web-view/client'

// Disable the context menu to have a more native feel
document.addEventListener("contextmenu", function(e) {
  // e.preventDefault();
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

	var span = document.createElement('span');
			span.setAttribute('id', 'fontlist');
			span.innerHTML = fontName;
	repFont.appendChild(span);
}

window.createFontList = function (rawFonts) {
	pluginCall('sendLog', 'Run: createFontList');
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

	select.onchange = changeTypeface;

	function changeTypeface (event) {
		pluginCall('sendLog', 'Call changeTypeface');
		var weightSelector = document.getElementById('weightlist');
		var selectedFont = document.getElementById('fontlist').value.replace(' ', '');

		for (var i = weightlist.children.length - 1; i >= 0; i--) {
			weightlist.removeChild(weightlist.children[i]);
		}

		var wl = getFontFamily(selectedFont);

		for (var i = 0; i < wl.length; i++) {
			var option = document.createElement('option');
			var label = document.createTextNode(wl[i][1]);
				option.setAttribute('value', wl[i][0]);
				option.appendChild(label);
			weightlist.appendChild(option);
		}
	}
}

window.sendMixingSetting = function () {
	var targetStrings = document.targetString;
	for (var i = targetStrings.length - 1; i >= 0; i--) {
		targetStrings[i];
	}
}

document.getElementById('mixing').addEventListener('click', function () {
	var select = document.getElementById('fontlist');
	if (select.hasAttribute('name')) {
		var selectFont = select.value;
	} else {
		var selectFont = select.textContent;
	}
	var targetStringState = document.getElementsByName('targetString');
	var targetStrings = {};
	for (var i = targetStringState.length - 1; i >= 0; i--) {
		if (true == targetStringState[i].checked) {
			targetStrings[targetStringState[i].value] = true;
		}
	}

	var customString = document.getElementById('customString').value;

	// document.getElementById('logs').innerHTML = targetStrings.toString();
  pluginCall('pushMixing', selectFont, targetStrings, customString);
  // window.close();
});

window.getFontFamily = function (fontName) {
		pluginCall('sendLog', 'Call getFontFamily');
		return [
            ["HelveticaNeue", "Regular", 5, 0], 
            ["HelveticaNeue-Italic", "Italic", 5, 1], 
            ["HelveticaNeue-UltraLight", "UltraLight", 2, 0], 
            ["HelveticaNeue-UltraLightItalic", "UltraLight Italic", 2, 1], 
            ["HelveticaNeue-Thin", "Thin", 3, 65536], 
            ["HelveticaNeue-ThinItalic", "Thin Italic", 3, 65537], 
            ["HelveticaNeue-Light", "Light", 3, 0], 
            ["HelveticaNeue-LightItalic", "Light Italic", 3, 1], 
            ["HelveticaNeue-Medium", "Medium", 6, 0], 
            ["HelveticaNeue-MediumItalic", "Medium Italic", 7, 1], 
            ["HelveticaNeue-Bold", "Bold", 9, 2], 
            ["HelveticaNeue-BoldItalic", "Bold Italic", 9, 3], 
            ["HelveticaNeue-CondensedBold", "Condensed Bold", 9, 66], 
            ["HelveticaNeue-CondensedBlack", "Condensed Black", 11, 66]
        ];
}