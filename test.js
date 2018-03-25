/**
 * THIS IS GOING TO BE A MASSIVE LIST
 * TODO: Make sure that key order does not affect how things work. You should be able to do `['client', 'options']` and
 * have it work just as well as `['options', 'client']`
 * TODO: Make sure that requires does not apply when the path is not completed going up to it
 * (if net deps on opt and is required, but opt is not selected (and is not required), dont query for it)
 * TODO: If something is required and selected and has required children, it should query for all of them
 * TODO: Make sure all required items at root are found
 */

const keys = ['client', 'network'];

const script = [
	{
		name: 'name',
		required: true
	},
	{
		name: 'client',
		required: (keys) => !keys.includes('server')
	}, {
		name: 'server',
		required: (keys) => !keys.includes('client')
	}, {
		name: 'options',
		depends: [['client'], ['server']],
		required: true
	}, {
		name: 'network',
		depends: ['options']
	}, {
		name: 'ajax',
		depends: ['client', 'options', 'network'],
		required: true
	}
].map(item => ({...item, depends: item.depends ? item.depends : [], required: typeof item.required === 'function' ? item.required(keys) : !!item.required}));


/* {
	client: [[]],
	server: [[]],
	options: [['client'], ['server']],
	network: [['client', 'options'], ['server', 'options']],
    ajax: [['client', 'options', 'network']]
}; */
const cleanObject = (obj, seen = []) => Object.keys(obj).reduce((prev, key) => {
	if (!Array.isArray(obj[key])) {
		throw new Error(key + 'is not an array. All deps must be an array')
	}
	if (obj[key].length > 0) {
		if (!obj[obj[key][0]]) {
			throw new Error(key + '-' + obj[key][0] + ' does not refer to a valid path')
		}
		const refArr = obj[obj[key][0]];
		if (!Array.isArray(refArr)) {
			throw new Error(obj[key][0] + 'is not an array. All deps must be an array')
		}
		if (refArr.length > 0) {
			// All items in array must be array
			if (Array.isArray(refArr[0])) {
				return {
					...prev, ...{
						[key]: refArr.map(items => {
							if (!Array.isArray(items)) {
								throw new Error(obj[key][0] + ' must not have a combination of arrays and non-arrays')
							}
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
				});
				seen.push(refArr[0]);
				const circDep = seen.find(see => see === key)
				if (!!circDep) {
					throw new Error('Cyclical dependancy detected between ' + obj[key] + ' and ' + key)
				}

				// Placing into double array for simpler
				return { ...prev, ...{ [key]: [[...obj[key], ...refArr]] } };
			}
			// Array is empty
		} else {
			return { ...prev, ...{ [key]: obj[key] } };
		}
		// Array is empty
	} else {
		return { ...prev, ...{ [key]: [obj[key]] } };
	}
}, {});

/* {
	client: [],
	server: [],
	options: [['client'], ['server']],
	network: ['options'],
    ajax: ['client', 'options', 'network']
}; */
const obj = cleanObject(script.reduce((prev, x) => {
	return { ...prev, ...{ [x.name]: x.depends ? x.depends : [] } }
}, {}));

/*
obj = {
    client: [[]],
    server: [[]],
    options: [[["client"],["server"]]],
    network: [["options","client"], ["options","server"]],
    ajax: [["client","options","network"]]
}
*/
const getChildren = (obj, keys) => {
	/*{
		"client": [false],
		"server": [false],
		"options": [false, false],
		"network": [true, false],
		"ajax": [false]
	}*/
	// Defaults to finding exact matches
	// Does not suport arr to be [], must be fixed
	// TODO: Change this from an array to an object with keys dammit Corbin
	const findMap = (arr = keys, arrComp = 'every', compareFn = ((arrLen, subArrLen) => arrLen === subArrLen)) =>
		Object.keys(obj).reduce((prev, key) => ({...prev,
			[key]: obj[key].map(subArr => compareFn(arr.length, subArr.length) ?
				// This could be rewritten as subArr[arrComp] but was not for code clarity and safety
				Array.prototype[arrComp].bind(subArr)(item => arr.find(find => find === item)) :
				false)
		}), {});

	// THIS IS VERY UNPERFORMANT - PLEASE SIMPLY ADD THIS FUNCTIONALITY TO findMap
	// ['client']
	// THIS MIGHT WORK NOW
	const flattenFindMap = (mapRes) => Object.keys(mapRes).reduce((prev, key) => mapRes[key].find(bool => !!bool) ? [...prev, key] : prev, []);



	// THIS IS VERY UNPERFORMANT - PLEASE SIMPLY ADD THIS FUNCTIONALITY TO findMap
	// [{key: 'client': index: 3}]
	const indexFindMap = (mapRes) => Object.keys(mapRes).reduce((prev, mapKey) => {
		// This can be a findIndex because there should be no more than a single instance that matches exactly the same in a key. If we wanted to, we could use reduce and add an error message if this did exist
		keyIndex = mapRes[mapKey].findIndex(bool => !!bool);
		return keyIndex !== -1 ? [...prev, { key: mapKey, index: keyIndex }] : prev
	}, []);

	// Start at root, find matching deps the rely on that, if required, then find deps that rely on that, and that and that
	// for each key, find matching deps the rely on that, if required, then find deps that rely on that, and that and that

	// This should work?
	const findPaths = (arr = keys) => {
		const tmpMap = findMap(arr);
		// [{key: 'client': index: 3}]
		objKeys = indexFindMap(tmpMap);
		console.log(objKeys);
		// Find index at which the findMap was true to pass to findPaths
		const requiredKeys = objKeys.filter(objKey => script.find(scriptItem => scriptItem.name === objKey.key).required);
		// Find required paths of children of required paths
		return requiredKeys.reduce((prev, reqKey) => [...prev, reqKey.key, ...findPaths([...obj[reqKey.key][reqKey.index], reqKey.key], true)], []);
	};

	const findKeysPaths = () => {
		keys.reduce((prev, key, index, array) => {
			const pathToFind = array.slice(0, index + 1);
			return [...prev, ...findPaths(pathToFind)];
		}, [])
	};


	matchMap = findMap();
	matchChildrenMap = findMap(keys, 'every', (arrLen, subArrLen) => arrLen < subArrLen);
	// To get `proximity` distance from, we need to make the `true` and `false` to return how many were accepted and how many weren't
	// closeMatchChildren = findMap('some', (arrLen, subArrLen) => true);

	// Get everything in the same branches of the graph

	// 'matchKey'
	// THIS MIGHT WORK NOW
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
	matchChildren = flattenFindMap(matchChildrenMap);
	return matchChildren;
};

// children = ['options', 'test']
// const checkIfRequired = (obj, children, keys) => {
// 	children
// }