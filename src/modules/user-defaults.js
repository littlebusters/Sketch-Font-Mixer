const pluginIdentifier = 'net.creative-tweet.font-mixer';
export const getDefaults = (key) => {
  var userDefaultsStore = NSUserDefaults.alloc().initWithSuiteName(pluginIdentifier);
  if (!userDefaultsStore.objectForKey('setdefaults')) {		
    userDefaultsStore.setBool_forKey(true,  'setdefaults');
    userDefaultsStore.setBool_forKey(false, 'forcepalt');
		userDefaultsStore.setBool_forKey(true,  'uppercase');
		userDefaultsStore.setBool_forKey(true,  'lowercase');
		userDefaultsStore.setBool_forKey(true,  'number');
		userDefaultsStore.setBool_forKey(true,  'punctuationmark');
		userDefaultsStore.setBool_forKey(false, 'hiragana');
		userDefaultsStore.setBool_forKey(false, 'katakana');
		userDefaultsStore.setBool_forKey(false, 'yakumono');
		userDefaultsStore.setBool_forKey(false, 'custom');

		userDefaultsStore.synchronize();
	}
	return userDefaultsStore.objectForKey(key);
}

export const setDefaults = (key, value) => {
    var userDefaultsStore = NSUserDefaults.alloc().initWithSuiteName(pluginIdentifier);
    userDefaultsStore.setObject_forKey(value, key);
    userDefaultsStore.synchronize();
}
