const pluginIdentifier = 'net.creative-tweet.font-mixer';
export const getDefaults = (key, all) => {
	if (!all) all = false;

  var userDefaults = NSUserDefaults.standardUserDefaults();
  if (userDefaults.dictionaryForKey(pluginIdentifier)) {
		if (all) {
			return userDefaults.dictionaryForKey(pluginIdentifier);
		} else {
			return userDefaults.dictionaryForKey(pluginIdentifier).objectForKey(key);
		}
	} else {
		return false;
	}
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
