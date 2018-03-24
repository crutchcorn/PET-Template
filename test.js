const script = [
	{
		name: 'client',
		depends: []
	}, {
		name: 'server',
		depends: []
	}, {
		name: 'options',
		depends: [['client'], ['server']]
	}, {
		name: 'network',
		depends: ['options']
	}, {
		name: 'ajax',
		depends: ['client', 'options', 'network']
	}
];

/* {
	client: [],
	server: [],
	options: [['client'], ['server']],
	network: ['options'],
    ajax: ['client', 'options', 'network']
}; */
const obj = script.reduce((prev, x) => {
	return {...prev, ...{[x.name]: x.depends}}
}, {});

/* {
	client: [[]],
	server: [[]],
	options: [['client'], ['server']],
	network: [['client', 'options'], ['server', 'options']],
    ajax: [['client', 'options', 'network']]
}; */
const findObjectChildren = (obj, seen = []) => Object.keys(obj).reduce((prev, key) => {
	if (!Array.isArray(obj[key])) {
		throw new Error(key + 'is not an array. All deps must be an array')
	}
	;
	if (obj[key].length > 0) {
		if (!obj[obj[key][0]]) {
			throw new Error(key + '-' + obj[key][0] + ' does not refer to a valid path')
		}
		const refArr = obj[obj[key][0]];
		if (!Array.isArray(refArr)) {
			throw new Error(obj[key][0] + 'is not an array. All deps must be an array')
		}
		;
		if (refArr.length > 0) {
			// All items in array must be array
			if (Array.isArray(refArr[0])) {
				return {
					...prev, ...{
						[key]: refArr.map(items => {
							if (!Array.isArray(items)) {
								throw new Error(obj[key][0] + ' must not have a combination of arrays and non-arrays')
							}
							;
							seen.push(items[0]);
							const circDep = seen.find(see => see === key)
							if (!!circDep) {
								throw new Error('Cyclical dependancy detected between ' + obj[key] + ' and ' + key)
							}
							return [...obj[key], ...items];
						})
					}
				};
				// All items in array must NOT be array
			} else {
				refArr.forEach((item) => {
					if (Array.isArray(item)) {
						throw new Error(obj[key][0] + ' must not have a combination of arrays and non-arrays')
					}
					;
				});
				seen.push(refArr[0]);
				const circDep = seen.find(see => see === key)
				if (!!circDep) {
					throw new Error('Cyclical dependancy detected between ' + obj[key] + ' and ' + key)
				}

				// Placing into double array for simpler
				return {...prev, ...{[key]: [[...obj[key], ...refArr]]}};
			}
		} else {
			return {...prev, ...{[key]: [obj[key]]}};
		}
	} else {
		return {...prev, ...{[key]: [obj[key]]}};
	}
}, {});


/*
obj = {
    client: [[]],
    server: [[]],
    options: [[["client"],["server"]]],
    network: [["options","client"], ["options","server"]],
    ajax: [["client","options","network"]]
}
keys = ['client', 'network', 'options']
*/
const matchKeys = (obj, keys) => {
	/*[
		{ "client": [false] },
		{ "server": [false] },
		{ "options": [false, false] },
		{ "network": [true, false] },
		{ "ajax": [false] }
	]*/
	// Defaults to finding exact matches
	const findMap = (arrComp = 'every', compareFn = ((arrLen, subArrLen) => arrLen === subArrLen)) =>
		Object.keys(obj).map(key => ({
			[key]: obj[key].map(subArr => compareFn(keys.length, subArr.length) ?
				// This could be rewritten as subArr[arrComp] but was not for code clarity and safety
				Array.prototype[arrComp].bind(subArr)(item => keys.find(find => find === item)) :
				false)
		}));


	matchMap = findMap();
	matchChildrenMap = findMap('every', (arrLen, subArrLen) => arrLen < subArrLen);
	// To get `proximity` distance from, we need to make the `true` and `false` to return how many were accepted and how many weren't
	// closeMatchChildren = findMap('some', (arrLen, subArrLen) => true);

	// 'matchKey'
	match = Object.keys(matchMap).reduce((prev, key) => {
		if (matchMap[key].find(bool => !!bool)) {
			if (!!prev) {
				// Is this really needed? I don't think so, because we only need to make sure that there is a match at all, but it might help match unexpected errors in plopfile - move to console.warn?
				throw new Error('There is more than one single match, you must have duplicates')
			} else {
				return key;
			}
		} else {
			return prev;
		}
	}, '');

	// ['key', 'child']
	matchChildren = Object.keys(matchChildrenMap).reduce((prev, key) => matchChildrenMap[key].find(bool => !!bool) ? [...prev, key] : prev, []);
};
