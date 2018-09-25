log('Font Mixer Start ------------------------------------------------');

import BrowserWindow from 'sketch-module-web-view'
import * as ud from './modules/user-defaults'
const UI = require('sketch/ui')
// const pluginIdentifier = "net.creative-tweet.font-mixer"

export default function(context) {
	// Language setting
	var lang = NSUserDefaults.standardUserDefaults().objectForKey("AppleLanguages").objectAtIndex(0);
	if ( 'ja-JP' != lang ) {
		lang = 'en';
	}

	// Check selection
	var sel = context.selection;
	log('🖌 Selection: ' + sel.length + ' Layer(s).');
	var isTwoSelected = false;
	if (2 < sel.length) {
		// log('🖌 Selection: ' + sel.length);
		UI.message('Please select one or more and less than two text layers for the object.')
		return false;
	} else if (1 > sel.length) {
		// log('🖌 Selection: ' + sel.length);
		UI.message('Please select one or more and less than two text layers for the object.')
		return false;
	} else {
		for (var i = sel.length - 1; i >= 0; i--) {
			if ('MSTextLayer' != sel[i].class()) {
				// log('🖌 isMSTextLayer: false');
				UI.message('Please select text layer(s).');
				return false;
			}
		}
		log('🖌 Selection check: ⭕️');
		if (2 == sel.length) isTwoSelected = true;
	}
	const orgnY  = sel[0].frame().y();
	const orgnH  = sel[0].frame().height();
	const orgnGH = sel[0].glyphBounds().size.height;
	const orgnGY = sel[0].glyphBounds().origin.y;
	// log('🖌 orgnY: ' + orgnY + ' / orgnH: ' + orgnH + ' / orgnGH: ' + orgnGH + ' / orgnGY: ' + orgnGY);

	var doc = context.document;

	// Get font value
	var orgFont  = Array(sel[0].fontPostscriptName());
	var fontSize = sel[0].fontSize();
	// log('🖌 orgFont: ' + orgFont + ' / ' + fontSize);
	var originalFont = convertToJSON(orgFont);

	var repFont = Array();
	// log('🖌 Replacement font check');
	if (isTwoSelected) {
		// log('🖌 repFont: ' + repFont);
		repFont[0] = sel[1].fontPostscriptName();
	}
	// log('🖌 Done✅: Replacement font check');
	var replacementFont = convertToJSON(repFont);

	var fontList = NSFontManager.sharedFontManager().availableFontFamilies();
	var fontlist_w_json = convertToJSON(fontList);
	
	// WebView options
	// log('🖌 WebView options');
  const options = {
    identifier: 'unique.id',
    width: 270,
    height: (isTwoSelected) ? 445 : 478,
    show: false,
    x: (ud.getDefaults('windowX')) ? ud.getDefaults('windowX') : null,
    y: (ud.getDefaults('windowY')) ? ud.getDefaults('windowY') : null
  }
	// log('🖌 -> BrowserWindow Instance');
  var browserWindow = new BrowserWindow(options);
	// log('🖌 -> webContents');
  const webContents = browserWindow.webContents;
	// log('🖌 Done✅: WebView options');

  // only show the window when the page has loaded
  browserWindow.once('ready-to-show', () => {
		// log('🖌 Show Panel');
    browserWindow.show();
    // log('🖌 -> executeJavascript');
    webContents.executeJavaScript(`appendOriginalFontName(${originalFont})`);
    // log('🖌 -> executeJavascript');
    webContents.executeJavaScript(`appendFontSize(${fontSize})`);

    var nsForcePalt = Array();
    nsForcePalt[0] = ud.getDefaults('forcepalt');
    var udForcePalt = convertToJSON(nsForcePalt);

    webContents.executeJavaScript(`setDefaultForcePalt(${udForcePalt})`);

    var nsTargetStrings = Object();
				nsTargetStrings['uppercase'] = ud.getDefaults('uppercase');
				nsTargetStrings['lowercase'] = ud.getDefaults('lowercase');
				nsTargetStrings['number'] = ud.getDefaults('number');
				nsTargetStrings['punctuationmark'] = ud.getDefaults('punctuationmark');
				nsTargetStrings['hiragana'] = ud.getDefaults('hiragana');
				nsTargetStrings['katakana'] = ud.getDefaults('katakana');
				nsTargetStrings['yakumono'] = ud.getDefaults('yakumono');
				nsTargetStrings['custom'] = ud.getDefaults('custom');
		var udTargetStrings = convertToJSON(nsTargetStrings);

		webContents.executeJavaScript(`setDefaultTargets(${udTargetStrings})`)

    if (isTwoSelected) {
			webContents.executeJavaScript(`appendReplacementFontName(${replacementFont})`);
		} else {
			let nsFonts = Array();
			nsFonts[0] = ud.getDefaults('disFont');
			nsFonts[1] = ud.getDefaults('repFont');
			var udFonts = convertToJSON(nsFonts);
	    webContents.executeJavaScript(`generateFontList(${fontlist_w_json}, ${udFonts})`);
	  }
  })

  // print a message when send value from WebView
	webContents.on('sendLog', (msg) => {
		log('🌐 ' + msg);
	})

	// Get font weight value and send value for WebView
	webContents.on('changedFont', (fontFamily) => {
		log('👉🏻 ' + fontFamily);
		var fontFamilies = NSFontManager.sharedFontManager().availableMembersOfFontFamily(fontFamily);

		var fontWeight = Array();
		for (var i = 0; i < fontFamilies.length; i++) {
			fontWeight[i] = Array();
			fontWeight[i][0] = fontFamilies[i][0];
			fontWeight[i][1] = fontFamilies[i][1];
		}
		webContents.executeJavaScript(`setFontWeight(${convertToJSON(fontWeight)})`);
	})

	// Exec font mix
  webContents.on('pushMixing', (fmSettings) => {
    log('pushMixing ----------->');

    var matchPattern = integrateMatchPattern(fmSettings.targetStrings, fmSettings.customString);

    var replacementRanges = generateReplacementRanges(sel[0].stringValue(), matchPattern);
    // log('-----------< pushMixing ' + "\r");

		log('applyReplacement ----------->');
		var applyFont = NSFont.fontWithName_size_(fmSettings.selectFont.toString(), fmSettings.fontSize);

		var forcePalt = ('palt' === fmSettings.forcepalt) ? true : false;
		if (forcePalt) {
			var features  = [{
				'CTFeatureTypeIdentifier': 22,
				'CTFeatureSelectorIdentifier': 5
			}];
			var fontDesc = applyFont.fontDescriptor();
			var fontDescAttr = fontDesc.fontDescriptorByAddingAttributes({NSCTFontFeatureSettingsAttribute: features});
			var palt = NSFont.fontWithDescriptor_size_(fontDescAttr, fmSettings.fontSize);
		}

		sel[0].setIsEditingText(true);
		// log('🖌 Apply settings');
		for (var i = 0; i < replacementRanges.length; i++) {
			sel[0].addAttribute_value_forRange_(
				NSFontAttributeName, 
				applyFont, 
				replacementRanges[i]);
			sel[0].addAttribute_value_forRange_(
				NSBaselineOffsetAttributeName, 
				fmSettings.baseline - 0, 
				replacementRanges[i]);
			if (forcePalt) {
				sel[0].addAttribute_value_forRange_(
					NSFontAttributeName, 
					palt, 
					replacementRanges[i]);
			}
		}
		// log('🖌 Done✅: Apply settings');
		sel[0].setIsEditingText(false);

		const aftrGH = sel[0].glyphBounds().size.height;
		const heightDiff   = sel[0].frame().height() - orgnH;
		const boundDiff    = orgnH - orgnGH;
		const gHeightDiff  = aftrGH - orgnGH;
		const fontSizeDiff = fmSettings.fontSize - fontSize;
		const isFSOrgnBigger = (fmSettings.fontSize < fontSize) ? true : false;

		// log('🖌 Position offset');
		if (2 != sel[0].textBehaviour() && 0 != replacementRanges.length) {
			if (isFSOrgnBigger && 0 < fmSettings.baseline - fontSizeDiff) {
				sel[0].frame().y = orgnY - heightDiff;
			} else {
				let offset = (0 > fmSettings.baseline) ? fmSettings.baseline : 0;
				sel[0].frame().y = orgnY - (sel[0].glyphBounds().origin.y + gHeightDiff - orgnGY) - offset;
			}
		}
		// log('🖌 Done✅: Position offset');


		// Set userDefaults
		if (!isTwoSelected) {
			ud.setDefaults('disFont', fmSettings.displayFontName);
			ud.setDefaults('repFont', fmSettings.selectFont);
		}
		ud.setDefaults('forcepalt', forcePalt);
		for (var target in fmSettings.targetStrings) {
			ud.setDefaults(target, fmSettings.targetStrings[target]);
		}
		// Window position
		const screenH = NSScreen.mainScreen().frame().size.height;
		const windowPosition = browserWindow.getPosition();
		ud.setDefaults('windowX', windowPosition[0]);
		ud.setDefaults('windowY', screenH - (windowPosition[1] + options.height));

		log('------------------------------------------------ Finished');
  })


  browserWindow.loadURL(require('../resources/plugin-ui.html'));

  // Generate match pattern for regexp
  function integrateMatchPattern (targetStrings, customString) {
		// log('integrateMatchPattern ---------->');
		var matchPattern = '[';
		if (targetStrings.uppercase) matchPattern += '\\u0041-\\u005A\\uFF21-\\uFF3A';
		if (targetStrings.lowercase) matchPattern += '\\u0061-\\u007A\\uFF41-\\uFF5A';
		if (targetStrings.number) matchPattern += '\\u0030-\\u0039\\uFF10-\\uFF19';
		if (targetStrings.punctuationmark) {
			matchPattern+= '\\u0020-\\u0023\\u0026-\\u002A\\u002C-\\u002F\\u003A-\\u003B\\u003F\\u0040\\u005B-\\u005D\\u005F\\u007B-\\u007E\\u00A0\\u00A1\\u00A6\\u00A7\\u00AB\\u00B6\\u00BB\\u00BF';
		}
		if (targetStrings.hiragana) matchPattern += '\\u3041-\\u3096';
		if (targetStrings.katakana) matchPattern += '\\u30A1-\\u30FA';
		if (targetStrings.yakumono) matchPattern += '\\u2010\\u2013\\u2014\\u2018\\u2019\\u201C\\u201D\\u2020-\\u2022\\u2025\\u2026\\u2032\\u2033\\u203B-\\u203D\\u2042\\u2047-\\u2049\\u2051\\u25E6\\u2660-\\u2667\\u2669-\\u266C\\u3000-\\u3003\\u3005\\u3008-\\u3011\\u3014-\\u3019\\u301C\\u301D\\u301F\\u3031-\\u3035\\u303B\\u303D\\u309D\\u309E\\u30A0\\u30FB\\u30FC-\\u30FE\\uFF01-\\uFF03\\uFF06-\\uFF0A\\uFF0C-\\uFF0F\\uFF1A\\uFF1B\\uFF1F\\uFF20\\uFF3B-\\uFF3D\\uFF3F\\uFF5B-\\uFF65\\uFF70';
		if (targetStrings.custom) {
			matchPattern += customString.replace(/%/g, '\\');
		}
		matchPattern += ']';
		// log('----------< integrateMatchPattern');

		return matchPattern;
  }

  function generateReplacementRanges (textString, matchPattern) {
		// log('generateReplacementRanges ---------->');
		var replacementRanges = Array();
		var regex = new RegExp(matchPattern);
		var startPoint = 0;
		var isTarget = 0;

		for (var i = 0; i < textString.length(); i++) {
			if (regex.test(textString.charAt(i))) {
				if (!isTarget) {
					isTarget = 1;
					startPoint = i;
				}
				// log(' -> ⭕️ Target:: i=' + i + ' / startPoint= ' + startPoint);
			} else {
				if (isTarget) {
					isTarget = 0;
					replacementRanges.push(NSMakeRange(startPoint, i - startPoint));
				}
				// log(' -> ❎ Not Target:: i=' + i + ' / startPoint= ' + startPoint);
			}
			// Last string
			if (textString.length() - 1 == i) {
				// log(' -> End of String');
				if (isTarget) {
					replacementRanges.push(NSMakeRange(startPoint, i + 1 - startPoint));
				}
			}
		}
		// log('----------< generateReplacementRanges');
		return replacementRanges;
  }
}

function convertToJSON (string) {
	// log('convertToJSON');
	var data = NSJSONSerialization.dataWithJSONObject_options_error_(string, 0, nil);
	var json = NSString.alloc().initWithData_encoding_(data, 4);

	return json;
}
