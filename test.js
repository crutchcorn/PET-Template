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
				return {...prev, ...{[key]: [[...obj[key], ...refArr]]}};
			}
			// Array is empty
		} else {
			return {...prev, ...{[key]: obj[key]}};
		}
		// Array is empty
	} else {
		return {...prev, ...{[key]: [obj[key]]}};
	}
}, {});

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
const getChildren = (obj, keys) => {
	const range = (num) => [...new Array(num)].map((_, i) => i);

	/*
		[{key: 'client': index: 3}]
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
					// TODO: Ensure this still works without length check - I THINK it does but /shrug
					// Recreate some with reduce
					const indexedSub = subArr.reduce((prev, item) => {
						const itemIndex = arr.findIndex(find => find === item);
						return itemIndex !== -1 ? [...prev, itemIndex] : prev;
					}, []);
					// Recreate every with reduce
					range(indexedSub.length).every(rng => indexedSub.includes(rng));

					return indexedSub.length > 0;


					// every(subArr.length === subArr.indexes)
				}
			});
			return index !== -1 ? [
				...prev,
				{key: key, index: index}
			] : prev;
		}, []);

	// Start at root, find matching deps the rely on that, if required, then find deps that rely on that, and that and that
	// for each key, find matching deps the rely on that, if required, then find deps that rely on that, and that and that

	// This works. Filters out things that are already included in keys (or at least should... :thinking_face:)
	const findPaths = (arr = keys) => {
		// [{key: 'client': index: 3}]
		const objKeys = findMap(arr);
		// Find index at which the findMap was true to pass to findPaths
		const requiredKeys = objKeys.filter(objKey => script.find(scriptItem => scriptItem.name === objKey.key).required && !keys.includes(objKey.key));
		// Find required paths of children of required paths
		return requiredKeys.reduce((prev, reqKey) => [...prev, reqKey.key, ...findPaths([...obj[reqKey.key][reqKey.index], reqKey.key], true)], []);
	};

	// This produces duplicates and should probably use a `Set`
	const findKeysPaths = () => [
		...findPaths([]), // Find all root reqs
		...keys.reduce((prev, key, index, array) => { // Get all key reqs
			const pathToFind = array.slice(0, index + 1);
			return [...prev, ...findPaths(pathToFind)];
		}, [])
	];
};
