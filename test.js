/**
 * THIS IS GOING TO BE A MASSIVE LIST
 * DONE: Make sure that key order does not affect how things work. You should be able to do `['client', 'options']` and
 * have it work just as well as `['options', 'client']`
 * DONE: Make sure that requires does not apply when the path is not completed going up to it
 * (if net deps on opt and is required, but opt is not selected (and is not required), dont query for it)
 * DONE: If something is required and selected and has required children, it should query for all of them
 * DONE: Make sure all required items at root are found
 * TODO: If a user passes an input that has a parent but does not pass the parent, prompt the user for the parent
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
		depends: ['optional'],
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
const getArr = (key, iter, array = [], seen = []) => {
	console.log('Key');
	console.log(key);
	console.log('Iter');
	console.log(iter);
	console.log('Array');
	console.log(array);
	if (iter.length > 0) {
		// `obj[key]` becomes the first level array
		const refArr = iter[0]; // 'optional'
		// If the first item is not an array, iterate through the first array and ensure each path is valid
		if (!Array.isArray(refArr)) {
			seen.push(refArr);
			const circDep = seen.find(see => see === key);
			if (!!circDep) {
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
			const {seen: _seen, arr} = getArr(refArr, obj[refArr], [...array], seen);
			console.log('Arr');
			console.log(arr);
			if (arr.length > 0 && Array.isArray(arr[0])) {
				// If this returns an array, expand that array out once more
				return {
					// This will make sure that if the parent has an array of options, it will expand out every possibility
					seen: _seen,
					arr: [...arr.reduce((prev, result) => [prev, ...[...result, ...array, ...iter]], [])]
				};
			} else {
				return {seen: _seen, arr: [...arr, ...array, ...iter]};
			}
		} else {
			// All items in array must be array
			// All items in those arrays must not be arrays
			// TODO: It does not seem to even be doing anything with the array items
			return {
				seen: seen, // Yes, this will be updated as `map` runs before the return. Tested
				arr: array.reduce((prev, items) => {
					console.log('Items');
					console.log(items);
					// Explicitly check if `items[0]` is an array to ensure the check in getArr doesn't fail
					if (!Array.isArray(items) || (Array.isArray(items) && Array.isArray(items[0]))) {
						throw new Error(key + ' contains an array where there should not be one. You cannot mix arrays and non-arrays or have a third level array')
					}
					const {seen: _seen, arr} = getArr(key, items, [...array, ...items], seen);
					seen = _seen;
					// We don't have to check if this is an array of arrays as we're not actually doing the checking of keys here
					return [...prev, ...arr];
				}, [])
			}
		}
	} else {
		console.log('Root')
		// This must mean that there is `[]` and we should wrap that to be `[[]]`
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

// TODO: Make this act like
const cleanObject = (obj) => {
	let seen = [];
	return Object.keys(obj).reduce((prev, key) => {
		if (!Array.isArray(obj[key])) {
			throw new Error(key + 'is not an array. All deps must be an array')
		}
		const {seen: _seen, arr} = getArr(key, obj[key], [], seen);
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
 * @returns {objKeys: [{key: 'client': index: 3}], reqKeys: ['options']}
 */
// TODO: Ensure that subArr contains arr in order. If it's missing something in the middle, return it
const findMap = (arr = keys) =>
	Object.keys(obj).reduce((prev, key) => {
		// This can be a findIndex because there should be no more than a single instance that matches exactly the same in a key. If we wanted to, we could use reduce and add an error message if this did exist
		const index = obj[key].findIndex(subArr => {
			// If we're searching for root reqs, ensure the args are in the root
			if (arr.length === 0) {
				return subArr.length === 0;
			} else {
				// Check if there are missing opts that an item in the keys depends on
				// Check if array is empty as to not falsly check root opts
				if (subArr.length !== 0) {
					// TODO: This is getting matched with ajax, which is both not required and not used. Must use `every` to filter this out
					// Recreate some with reduce
					const prependSubArr = [key, ...subArr];
					const indexedSub = arr.reduce((prevSub, item) => {
						const itemIndex = prependSubArr.findIndex(find => find === item);
						console.log('itemIndex ' + itemIndex);
						return itemIndex !== -1 ? [...prevSub, itemIndex] : prevSub;
					}, []);
					// Recreate every with reduce
					console.log(indexedSub);
					const missing = range(indexedSub.length).reduce((prevSub, rng) => {
						const valid = indexedSub.includes(rng);
						if (valid) {
							console.log(key + ' is missing an input');
						}
						return valid ? prevSub : [...prevSub, prependSubArr[rng]];
					}, []);
					prev.reqKeys = [...prev.reqKeys, ...missing];
					return indexedSub.length > 0;
				} else {
					return false;
				}
			}
		});
		return {
			...prev,
			objKeys: index !== -1 ? [
				...prev.objKeys,
				{key: key, index: index}
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

// This produces duplicates and should probably use a `Set`
const findKeysPaths = () => [
	...findPaths([]), // Find all root reqs
	...keys.reduce((prev, key, index, array) => { // Get all key reqs
		const pathToFind = array.slice(0, index + 1);
		return [...prev, ...findPaths(pathToFind)];
	}, [])
];