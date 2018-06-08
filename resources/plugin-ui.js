import pluginCall from 'sketch-module-web-view/client'

document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
});

function sendLog (msg) {
	pluginCall('sendLog', msg);
}

window.appendOriginalFontName = function (fontName) {
	pluginCall('sendLog', '🏃🏻‍♂️ appendOriginalFontName: ' + fontName);

	document.getElementById('orgFont').innerHTML = fontName.toString().replace(/-/g, ' ');
}

window.appendReplacementFontName = function (fontName) {
	pluginCall('sendLog', '🏃🏻‍♂️ appendReplacementFontName: ' + fontName);
	var slct = document.getElementById('replacement-section');
	var base = document.getElementById('size-baseline');
	var dl   = document.getElementById('replacement');
	slct.removeChild(dl)

	var pragraph = document.createElement('p');
			pragraph.setAttribute('id', 'weightlist');
			pragraph.setAttribute('class', 'fixed');
			pragraph.innerHTML = fontName.toString().replace(/-/g, ' ');
	// slct.appendChild(pragraph);
	slct.insertBefore(pragraph, base);
}

window.appendFontSize = function (fontSize) {
	pluginCall('sendLog', '🏃🏻‍♂️ appendFontSize: ' + fontSize);
	var fsInput = document.getElementById('repfont-size__value');
	fsInput.value = fontSize;
}

window.generateFontList = function (rawFonts, udFonts) {
	pluginCall('sendLog', '🏃🏻‍♂️ generateFontList');
	pluginCall('sendLog', udFonts);
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
		if (udFonts[0] === fontList[i]) {
			option.setAttribute('selected', 'selected');
		}
		var label = document.createTextNode(fontList[i]);
		option.appendChild(label);
		typefaceSelector.appendChild(option);
	}

	// Generate initial weight list
	pluginCall('changedFont', typefaceSelector.value);
	var defaultWeightSelector = document.getElementById('weightlist');
	generateWeightList(defaultWeightSelector, window.fontWeightList, udFonts[1]);

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

window.generateWeightList = function (ws, wl, ud) {
	if(!ud) ud = false;
	for (var i = 0; i < wl.length; i++) {
		var option = document.createElement('option');
			option.setAttribute('value', wl[i][0]);
		if (ud === wl[i][0]) {
			option.setAttribute('selected', 'selected');
		}
		var label = document.createTextNode(wl[i][1]);
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
	pluginCall('sendLog', ' fontWeightList.length: ' + fontWeightList.length);
}

window.sendMixingSetting = function () {
	var targetStrings = document.targetString;
	for (var i = targetStrings.length - 1; i >= 0; i--) {
		targetStrings[i];
	}
}

window.setDefaultForcePalt = function(fp) {
	pluginCall('sendLog', ' setDefaultForcePalt : ' + fp[0]);
	if (true === fp[0]) {
		document.getElementById('repfont-force-palt__value').setAttribute('checked', 'checked');
	}
}

window.setDefaultTargets = function (ts) {
	var targetStringState = document.getElementsByName('targetString');
	for (var i = targetStringState.length - 1; i >= 0; i--) {
		if (true === ts[targetStringState[i].value]) {
			targetStringState[i].setAttribute('checked', 'checked');
		}
	}
}

document.getElementById('mixing').addEventListener('click', function () {
	var fmSettings = {}

	var select = document.getElementById('weightlist');
	if (select.hasAttribute('name')) {
		fmSettings.selectFont = select.value;
		var displayFontName = document.getElementById('fontlist');
		fmSettings.displayFontName = displayFontName.value;
	} else {
		fmSettings.selectFont = select.textContent.replace(/ /g, '-');;
	}

	fmSettings.fontSize = document.getElementById('repfont-size__value').value;
	if (1 > fmSettings.fontSize) {
		fmSettings.fontSize = 1;
	}

	fmSettings.baseline = document.getElementById('repfont-baseline__value').value;

	if (true == document.getElementById('repfont-force-palt__value').checked) {
		fmSettings.forcepalt = document.getElementById('repfont-force-palt__value').value;
	} else {
		fmSettings.forcepalt = false;
	}

	var targetStringState = document.getElementsByName('targetString');
	fmSettings.targetStrings = {};
	for (var i = targetStringState.length - 1; i >= 0; i--) {
		if (true == targetStringState[i].checked) {
			fmSettings.targetStrings[targetStringState[i].value] = true;
		} else {
			fmSettings.targetStrings[targetStringState[i].value] = false;
		}
	}

	fmSettings.customString = escape(document.getElementById('customString').value);

  pluginCall('pushMixing', fmSettings);

  window.close();
});
