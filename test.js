/**
 * THIS IS GOING TO BE A MASSIVE LIST
 * DONE: Make sure that key order does not affect how things work. You should be able to do `['client', 'options']` and
 * have it work just as well as `['options', 'client']`
 * DONE: Make sure that requires does not apply when the path is not completed going up to it
 * (if net deps on opt and is required, but opt is not selected (and is not required), dont query for it)
 * DONE: If something is required and selected and has required children, it should query for all of them
 * DONE: Make sure all required items at root are found
 * DONE: If a user passes an input that has a parent but does not pass the parent, prompt the user for the parent
 * DONE: Test If the user is missing multiple inputs that share the same path (if you put in `client`, `network` but you could go `client`, `test`, `network` OR `client`, `blah`, `network`
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
		name: 'optional'
	}, {
		name: 'test',
		depends: ['client'],
		required: true
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
].map(item => ({
	...item,
	depends: item.depends ? item.depends : [],
	required: typeof item.required === 'function' ? item.required(keys) : !!item.required
}));


// Pass in an array and have it iterate through `arr[]` or just arr
// Return that `arr` changed to allow for info on each
// `iter` should start with `obj[key]`
// Array is the built-up array that's gone from this point
// 'network', ['options']
const getArr = (key, iter, seen = [], obj) => {
	if (iter.length > 0) {
		// `obj[key]` becomes the first level array
		const refArr = iter[0]; // 'options'
		// If the first item is not an array, iterate through the first array and ensure each path is valid
		if (!Array.isArray(refArr)) {
			// 'options'
			seen.push(refArr);
			const circDep = seen.find(see => see === key);
			if (!!circDep) {
				// TODO: This will report the wrong two object keys. `keys` is correct but `obj[keys]` is not
				throw new Error('Cyclical dependancy detected between ' + obj[key] + ' and ' + key)
			}
			iter.forEach(arrKey => {
				// Ensure the object does not mix arrays and non-arrays
				if (Array.isArray(arrKey)) {
					throw new Error(key + ' contains an array where there should not be one. You cannot mix arrays and non-arrays or have a third level array')
				} else {
					// Ensure that each key being passed in the array is valid
					if (!obj[arrKey]) {
						throw new Error(key + ' - ' + arrKey + ' does not refer to a valid path')
					}
				}
			});
			// This is the parent of the child
			// Since this only is a single level deep array, we must turn it into a second level array
			// Check if the parent of the child has an array of deps or an array of an array
			// 'network', [["client"], ["server"]], ['options'], ['options']
			const {seen: _seen, arr} = getArr(key, obj[refArr], seen, obj);
			if (arr.length > 0 && Array.isArray(arr[0])) {
				// If this returns an array, expand that array out once more
				return {
					// This will make sure that if the parent has an array of options, it will expand out every possibility
					seen: _seen,
					// arr = [[ 'test', 'client' ], [[ 'optional', 'server' ], [ 'otherOpt', 'server' ]]]
					arr: arr.reduce((prev, result) => {
						// [ 'test', 'client' ]
						// [[ 'optional', 'server' ], [ 'otherOpt', 'server' ]]
						if (Array.isArray(result[0])) {
							// [[ 'optional', 'server' ], [ 'otherOpt', 'server' ]]
							return [...prev, ...result.map(item => [...item, ...iter])];
						} else {
							// ['client']
							return [...prev, [...result, ...iter]];
						}
					}, [])
				};
			} else {
				return {seen: _seen, arr: [...arr, ...iter]};
			}
		} else {
			// All items in array must be array
			// All items in those arrays must not be arrays
			return {
				seen: seen, // Yes, this will be updated as `map` runs before the return. Tested
				// [["client"], ["server"]]
				arr: iter.reduce((prev, items) => {
					// items = ['client']
					// Explicitly check if `items[0]` is an array to ensure the check in getArr doesn't fail
					if (!Array.isArray(items) || (Array.isArray(items) && Array.isArray(items[0]))) {
						throw new Error(key + ' contains an array where there should not be one. You cannot mix arrays and non-arrays or have a third level array')
					} // arr = []
					const {seen: _seen, arr} = getArr(key, items, seen, obj);
					seen = _seen;
					// arr = []
					// items = ['client']
					// We don't have to check if this is an array of arrays as we're not actually doing the checking of keys here
					return [...prev, arr];
				}, [])
			}
		}
	} else {
		return {seen: seen, arr: []};
	}
};

/* {
	client: [[]],
	server: [[]],
	options: [['client'], ['server']],
	network: [['client', 'options'], ['server', 'options']],
    ajax: [['client', 'options', 'network']]
}; */
const cleanObject = (obj) => {
	let seen = [];
	return Object.keys(obj).reduce((prev, key) => {
		if (!Array.isArray(obj[key])) {
			throw new Error(key + 'is not an array. All deps must be an array')
		}
		const {seen: _seen, arr} = getArr(key, obj[key], seen, obj);
		seen = _seen;
		// Results in [] or [[]]. Should return [[]] always
		return {...prev, [key]: Array.isArray(arr[0]) ? arr : [arr]};
	}, {})
};

/* {
	client: [],
	server: [],
	options: [['client'], ['server']],
	network: ['options'],
    ajax: ['client', 'options', 'network']
}; */
const obj = cleanObject(script.reduce((prev, x) => ({...prev, ...{[x.name]: x.depends}}), {}));

/*
obj = {
    client: [[]],
    server: [[]],
    options: [[["client"],["server"]]],
    network: [["options","client"], ["options","server"]],
    ajax: [["client","options","network"]]
}
*/

const range = (num) => [...new Array(num)].map((_, i) => i);

/**
 * A function that traverses the tree for any given match of given keys.
 * @param arr - An array containing keys
 * @returns {Array} - An array containing the key and index of the path that was found to be within the arr's graph children path
 * { objKeys: [ { key: 'network', index: 0 } ], reqKeys: [ 'options' ] }
 */
// DONE: Will only find the first result that matches the keys input
// TODO:  If an exact match is found, ignore missing keys from other possible paths
// TODO: Find required children of those paths (or exact paths)
// TODO: This code BARELY functions and doesn't even realistically return anything near what I'd want it to. Scope creep has destroyed this function and it's logic needs to be rewritten
// TODO: This should match all required paths starting from root. This means that if the start is all required, keep going until you hit something that isn't required
// TODO: This should probably have a `partialMatchReq`, `partialChildrenReq`, `fullChildrenReq` in a reduce function and then use an `async await` to break that down into a simple array of keys to be required
const findMap = (arr = keys) =>
	Object.keys(obj).reduce((prev, key) => {
		// Find indexes of obj[key] that match `keys` input
		const indexs = obj[key].reduce((prevKey, subArr, index) => {
				// If `key` is a root item, check if it's required and add it if it is and nothing was passed to it
				if (subArr.length === 0 || (subArr.length === 1 && subArr[0].length === 0) && script[key].required && !keys.find(key)) {
					prev.reqKeys = [...prev.reqKeys, key];
				}
				// Check if there are missing opts that an item in the keys depends on
				// Check if array is empty as to not falsly check root opts
				if (subArr.length !== 0) {
					// Recreate some with reduce
					const prependSubArr = [...subArr, key];
					// Finds possible paths that could be going down
					const indexedSub = arr.reduce((prevSub, item) => {
						const itemIndex = prependSubArr.findIndex(find => find === item);
						return itemIndex !== -1 ? [...prevSub, itemIndex] : prevSub;
					}, []);
					if (indexedSub.length === subArr.length) {
						// This either means that it was a total match with children
						// OR that there was more matching than subArr.length with things missing in it
					} else if (indexedSub.length > subArr.length) {
						// This either means that it was a total match with children
						// OR that there was more matching than subArr.length with things missing in it
					}
					// Recreate every with reduce
					const maxIndexSub = Math.max(...indexedSub, -1);
					// Ensure that we are not checking against items that are longer than the given input to prevent false `req` flags

					const indexSameLenArr = maxIndexSub === arr.length;
					// This should be a perfect match with no children or missing items
					const perfectMatch = indexSameLenArr && prependSubArr.length === indexedSub.length;
					// This should be a perfect match with children but no missing items
					const perfMatchWKids = indexSameLenArr  && arr.length < prependSubArr.length;

					// If there are missing items with child items
					if (perfMatchWKids || !(maxIndexSub !== arr.length && prependSubArr === maxIndexSub)) {
						const children = prependSubArr.slice(maxIndexSub, prependSubArr.length);
						const reqChild = [];
						for (const child of children) {
							if (script[child].required) {
								reqChild.push(child);
							} else {
								break; // Breaks out as soon as something is found that is not required as it should stop as close to `key` as possible
							}
						}
						// TODO: Do something with reqChild
						// TODO: It might be a good idea to seperate the children reqs for each but they use the same logic soooo /shrug
					}

					// TODO: Only check missing against maxIndexSub so that you don't get any child path that's not intended
					// TODO: The children of these items will be checked to see if there's any required
					// Checks against possible paths and finds missing items from those paths
					// TODO: Skip missing checks for both of these
					if (perfMatchWKids || perfectMatch) {}
					const missing = range(prependSubArr.length).reduce((prevSub, rng) => {
						const valid = indexedSub.includes(rng);
						return valid ? prevSub : [...prevSub, prependSubArr[rng]];
					}, []);
					prev.reqKeys = [...prev.reqKeys, ...missing];
					return indexedSub.length > 0 ? [...prevKey, index] : prevKey;
				} else {
					return prevKey;
				}
		}, []);
		return {
			...prev,
			objKeys: indexs.length > 0 ? [
				...prev.objKeys,
				...indexs.map(index => ({key: key, index: index}))
			] : prev.objKeys
		};
	}, {objKeys: [], reqKeys: []});

// Start at root, find matching deps the rely on that, if required, then find deps that rely on that, and that and that
// for each key, find matching deps the rely on that, if required, then find deps that rely on that, and that and that

// This works. Filters out things that are already included in keys (or at least should... :thinking_face:)
const findPaths = (arr = keys) => {
	// ['client']
	// [{key: 'client': index: 3}]
	const {objKeys, reqKeys} = findMap(arr);
	// Find index at which the findMap was true to pass to findPaths
	const requiredKeys = objKeys.filter(objKey => script.find(scriptItem => scriptItem.name === objKey.key).required && !keys.includes(objKey.key));
	console.log(reqKeys);
	// reqKeys.map()
	// Find required paths of children of required paths
	// return requiredKeys.reduce((prev, reqKey) => [...prev, reqKey.key, ...findPaths(obj[reqKey.key][reqKey.index], true)], reqKeys);
};

console.log(obj);
console.log(findMap(keys));

// This produces duplicates and should probably use a `Set`
const findKeysPaths = () => [
	...keys.reduce((prev, key, index, array) => { // Get all key reqs
		const pathToFind = array.slice(0, index + 1);
		return [...prev, ...findPaths(pathToFind)];
	}, [])
];