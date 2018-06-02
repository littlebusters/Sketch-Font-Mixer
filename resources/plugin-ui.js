import pluginCall from 'sketch-module-web-view/client'

document.addEventListener("contextmenu", function(e) {
  // e.preventDefault();
});

function sendLog (msg) {
	pluginCall('sendLog', msg);
}

window.appendOriginalFontName = function (fontName) {
	pluginCall('sendLog', '🏃🏻‍♂️ appendOriginalFontName: ' + fontName);

	document.getElementById('orgFont').innerHTML = fontName.toString().replace('-', ' ');
}

window.appendReplacementFontName = function (fontName) {
	pluginCall('sendLog', '🏃🏻‍♂️ appendReplacementFontName: ' + fontName);
	var sect = document.getElementById('replacement-section');
	var dl   = document.getElementById('replacement');
	sect.removeChild(dl)

	var pragraph = document.createElement('p');
			pragraph.setAttribute('id', 'fontlist');
			pragraph.innerHTML = fontName.toString().replace('-', ' ');
	sect.appendChild(pragraph);
}

window.appendFontSize = function (fontSize) {
	pluginCall('sendLog', '🏃🏻‍♂️ appendFontSize: ' + fontSize);
	var fsInput = document.getElementById('repfont-size__value');
	fsInput.value = fontSize;
}

window.generateFontList = function (rawFonts) {
	pluginCall('sendLog', '🏃🏻‍♂️ generateFontList');
	var typefaceSelector = document.getElementById('fontlist');

	// Remove used font
	var dividerPosition = 0;	
	for (var i = 0; i < rawFonts.length; i++) {
		if (null == rawFonts[i]) {
			dividerPosition = i + 1;
			break;
		}
	}

	// Generate typeface list
	var fontList = rawFonts.slice(dividerPosition, rawFonts.length);
	for (var i = 0; i < fontList.length; i++) {
		var option = document.createElement('option')
				option.setAttribute('value', fontList[i]);
		var label = document.createTextNode(fontList[i]);
		option.appendChild(label);
		typefaceSelector.appendChild(option);
	}

	// Generate initial weight list
	pluginCall('changedFont', typefaceSelector.value);
	var defaultWeightSelector = document.getElementById('weightlist');
	generateWeightList(defaultWeightSelector, window.fontWeightList);

	// Add event 'onChange'
	typefaceSelector.onchange = changeTypeface;

	// 
	function changeTypeface (event) {
		pluginCall('sendLog', '🏃🏻‍♂️ changeTypeface: ' + typefaceSelector.value);
		pluginCall('changedFont', typefaceSelector.value);

		var weightSelector = document.getElementById('weightlist');
		// var selectedFont = document.getElementById('fontlist').value.replace(' ', '');

		for (var i = weightSelector.children.length - 1; i >= 0; i--) {
			weightSelector.removeChild(weightSelector.children[i]);
		}

		generateWeightList(weightSelector, window.fontWeightList);
	}
}

window.generateWeightList = function (ws, wl) {
	for (var i = 0; i < wl.length; i++) {
		var option = document.createElement('option');
		var label = document.createTextNode(wl[i][1]);
			option.setAttribute('value', wl[i][0]);
			option.appendChild(label);
		ws.appendChild(option);
	}
}

window.fontWeightList = [];
window.setFontWeight = function (fontweight) {
	pluginCall('sendLog', '🏃🏻‍♂️ setFontWeight');
	pluginCall('sendLog', ' before: ' + fontweight);
	window.fontWeightList = fontweight;
	pluginCall('sendLog', ' after : ' + fontWeightList);
	pluginCall('sendLog', ' ' + fontWeightList.length);
}

window.sendMixingSetting = function () {
	var targetStrings = document.targetString;
	for (var i = targetStrings.length - 1; i >= 0; i--) {
		targetStrings[i];
	}
}

document.getElementById('mixing').addEventListener('click', function () {
	var select = document.getElementById('weightlist');
	if (select.hasAttribute('name')) {
		var selectFont = select.value;
	} else {
		var selectFont = select.textContent;
	}

	var fontSize = document.getElementById('repfont-size__value').value;

	var targetStringState = document.getElementsByName('targetString');
	var targetStrings = {};
	for (var i = targetStringState.length - 1; i >= 0; i--) {
		if (true == targetStringState[i].checked) {
			targetStrings[targetStringState[i].value] = true;
		}
	}

	var customString = escape(document.getElementById('customString').value)
  pluginCall('pushMixing', selectFont, fontSize, targetStrings, customString);

  window.close();
});
