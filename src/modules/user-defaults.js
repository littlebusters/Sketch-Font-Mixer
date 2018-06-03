const pluginIdentifier = 'net.creative-tweet.font-mixer';
export const getDefaults = (key) => {
  var userDefaults = NSUserDefaults.standardUserDefaults();
  if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
		var defaultPreferences = NSUserDefaults.alloc().initWithSuiteName(pluginIdentifier);
		
    defaultPreferences.setObject_forKey('forcepalt', false);
		defaultPreferences.setObject_forKey('uppercase', true);
		defaultPreferences.setObject_forKey('lowercase', true);
		defaultPreferences.setObject_forKey('number', true);
		defaultPreferences.setObject_forKey('punctuationmark', true);
		defaultPreferences.setObject_forKey('hiragana', false);
		defaultPreferences.setObject_forKey('katakana', false);
		defaultPreferences.setObject_forKey('yakumono', false);

		userDefaults.setObject_forKey(defaultPreferences, pluginIdentifier);
	}
	return userDefaults.dictionaryForKey(pluginIdentifier).objectForKey(key);
}

export const setDefaults = (key, value) => {
    var userDefaults = NSUserDefaults.standardUserDefaults();
    if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
        var preferences = NSMutableDictionary.alloc().init();
    } else {
        var preferences = NSMutableDictionary.dictionaryWithDictionary(userDefaults.dictionaryForKey(pluginIdentifier));
    }
    preferences.setObject_forKey(value, key);
    userDefaults.setObject_forKey(preferences, pluginIdentifier);
}
