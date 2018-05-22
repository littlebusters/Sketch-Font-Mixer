import BrowserWindow from 'sketch-module-web-view'
const UI = require('sketch/ui')

export default function(context) {
	log('27: Start ------------------------------------------------');

	var lang = NSUserDefaults.standardUserDefaults().objectForKey("AppleLanguages").objectAtIndex(0);
	if ( 'ja-JP' != lang ) {
		lang = 'en';
	}
	var sel = context.selection;
	var isTwoSelected = false;
	if (2 < sel.length) {
		UI.message('Please select one or more and less than two text layers for the object.')
		return false;
	} else if (1 > sel.length) {
		UI.message('Please select one or more and less than two text layers for the object.')
		return false;
	} else {
		for (var i = sel.length - 1; i >= 0; i--) {
			if ('MSTextLayer' != sel[i].class()) {
				UI.message('Please select text layer(s).');
				return false;
			}
		}
		if (2 == sel.length) isTwoSelected = true;
	}

	var doc = context.document;

	// var orgFont = sel[0].fontPostscriptName();
	var orgFont = Array(sel[0].fontPostscriptName());
	log('orgFont: ' + orgFont);
	var originalFont = convertToJSON(orgFont);
	var repFont = Array();
	if (2 == sel.length) {
		repFont[0] = sel[1].fontPostscriptName();
	}
	var replacementFont = convertToJSON(repFont);

	var fontList = NSFontManager.sharedFontManager().availableFontFamilies();
	// log(fontList.class());
	// var fontList = doc.documentData().fontList();
	// fontList.reloadFonts();
	// var fontlist_w_json = convertToJSON(fontList.allFonts());
	var fontlist_w_json = convertToJSON(fontList);
	// var fontlist_w_json = fontList;
	

  const options = {
    identifier: 'unique.id',
    width: 240,
    height: (isTwoSelected) ? 420 : 450,
    show: false
  }

  var browserWindow = new BrowserWindow(options)

  // only show the window when the page has loaded
  browserWindow.once('ready-to-show', () => {
    browserWindow.show();
    webContents.executeJavaScript(`appendOriginalFontName(${originalFont})`);
    if (isTwoSelected) {
			webContents.executeJavaScript(`appendReplacementFontName(${replacementFont})`);
		} else {
	    webContents.executeJavaScript(`createFontList(${fontlist_w_json})`);
	  }
    // webContents.executeJavaScript(`createPluginUI(${orgFont})`);
  })

  const webContents = browserWindow.webContents

  // print a message when the page loads
  webContents.on('did-finish-load', () => {
    UI.message('UI loaded!');
  })

  // add a handler for a call from web content's javascript
  webContents.on('nativeLog', (s) => {
    UI.message(s)
    webContents.executeJavaScript(`setRandomNumber(${Math.random()})`)
  })
	webContents.on('sendLog', (msg) => {
		log('🌐 ' + msg);
	})

  webContents.on('pushMixing', (selectFont, targetStrings, customString) => {
    // UI.message(selectFont);
    log('pushMixing ----------->');
    log('selectFont: ' + selectFont);
    log('targetStrings: ' + targetStrings);
    log('customString: ' + customString);

    var matchPattern = integrateMatchPattern(targetStrings, customString);
    log('matchPattern:');
    log(matchPattern);
    var replacementRanges = createReplacementRanges(sel[0].stringValue(), matchPattern);
    log(replacementRanges);
    log('-----------> pushMixing ');
    log("\r");
    applyReplacement(sel[0], repFont, replacementRanges);
  })

  browserWindow.loadURL(require('../resources/plugin-ui.html'));

  function integrateMatchPattern (targetStrings, customString) {
		log('integrateMatchPattern ---------->');
		var matchPattern = '[';
		if (targetStrings.uppercase) matchPattern += '\\u0041-\\u005A\\uFF21-\\uFF3A';
		if (targetStrings.lowercase) matchPattern += '\\u0061-\\u007A\\uFF41-\\uFF5A';
		if (targetStrings.number) matchPattern += '\\u0030-\\u0039\\uFF10-\\uFF19';
		if (targetStrings.symbol) {
			matchPattern+= '\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E\\u00A1-\\u00A7\\u00AB\\u00B6\\u00BB\\u00BF';
			matchPattern += '\\u2010\\u2013\\u2014\\u2018\\u2019\\u201C\\u201D\\u2020-\\u2022\\u2025\\u2026\\u2032\\u2033\\u203B-\\u203D\\u2042\\u2047-\\u2049\\u2051\\u25E6\\u2660-\\u266C';
			matchPattern += '\\u3001-\\u3011\\u3014-\\u301F\\u3031\\u3032\\u3033\\u3034\\u3035\\u303B\\u303D\\u309D\\u309E\\u30A0\\u30FB-\\u30FE';
			matchPattern += '\\uFF01-\\uFF0F\\uFF1A-\\uFF20\\uFF3B-\\uFF3F\\uFF5B-\\uFF65\\uFF70\\uFFE0-\\uFFE6'; 
		}
		if (targetStrings.hiragana) matchPattern += '\\u3041-\\u3096';
		if (targetStrings.katakana) matchPattern += '\\u30A1-\\u30FA';
		if (targetStrings.custom) matchPattern += encodeURI(customString);

		matchPattern += ']';

		return matchPattern;
  }

  function createReplacementRanges (textString, matchPattern) {
		log('createReplacementRanges ---------->');
		var replacementRanges = Array();
		var regex = new RegExp(matchPattern);
		var startPoint = 0;
		var isTarget = 0;

		for (var i = 0; i < textString.length(); i++) {
			// log(textString.charAt(i));
			if (regex.test(textString.charAt(i))) {
				if (!isTarget) {
					isTarget = 1;
					startPoint = i;
				}
				// log(' -> ⭕️ Target:: i=' + i + ' / startPoint= ' + startPoint);
			} else {
				if (isTarget) {
					isTarget = 0;
					// replacementRanges.push(new Array(startPoint, i - startPoint));
					replacementRanges.push(NSMakeRange(startPoint, i - startPoint));
				}
				// log(' -> ❎ Not Target:: i=' + i + ' / startPoint= ' + startPoint);
			}
			// Last string
			if (textString.length() - 1 == i) {
				// log(' -> End of String');
				if (isTarget) {
					// replacementRanges.push(new Array(startPoint, i + 1 - startPoint));
					replacementRanges.push(NSMakeRange(startPoint, i + 1 - startPoint));
				}
			}
		}
		// log(replacementRanges);
		return replacementRanges;
  }
}

function applyReplacement (targetLayer, replacementFont, replacementRanges) {
	log('applyReplacement ----------->');
	var fontSize = targetLayer.fontSize();
	var applyFont = NSFont.fontWithName_size_(replacementFont.toString(), fontSize);

	targetLayer.setIsEditingText(true);
	for (var i = 0; i < replacementRanges.length; i++) {
		targetLayer.addAttribute_value_forRange_(NSFontAttributeName, applyFont, replacementRanges[i]);
	}
	targetLayer.setIsEditingText(false);
	log('finished');
}

function convertToJSON (string) {
	var data = NSJSONSerialization.dataWithJSONObject_options_error_(string, 0, nil);
	var json = NSString.alloc().initWithData_encoding_(data, 4);

	return json;
}
// Type something

//