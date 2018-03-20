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
]

const obj = script.reduce((acc, x) => {
    return {...acc, ...{[x.name]: x.depends}}
}, {});

/* {
	client: [],
	server: [],
	options: [['client'], ['server']],
	network: ['options'],
    ajax: ['client', 'options', 'network']
}; */

const ks = Object.keys(obj);

const seen = [];
const newObj = ks.reduce((arr, key, index, keys) => {
    console.log(arr);
    if (!Array.isArray(obj[key])) { throw new Error(key + 'is not an array. All deps must be an array')};
    if (obj[key].length > 0) {
        if (!obj[obj[key][0]]) { throw new Error(key + '-' + obj[key][0] + ' does not refer to a valid path') }
        const refArr = obj[obj[key][0]]
        if (!Array.isArray(refArr)) { throw new Error(obj[key][0] + 'is not an array. All deps must be an array') };
        if (refArr.length > 0) {
            // All items in array must be array
            if (Array.isArray(refArr[0])) {
                return { ...arr, ...{[key]: refArr.map(items => {
                        if (!Array.isArray(items)) { throw new Error(obj[key][0] + ' must not have a combination of arrays and non-arrays') };
                        seen.push(items[0]);
                        const circDep = seen.find(see => see === key)
                        if (!!circDep) { throw new Error('Cyclical dependancy detected between ' + obj[key] + ' and ' + key) }
                        return [...obj[key], ...items];
                    })
                }};
                // All items in array must NOT be array
            } else {
                refArr.forEach((item, index) => {
                    if (Array.isArray(item)) { throw new Error(obj[key][0] + ' must not have a combination of arrays and non-arrays') };
                })
                seen.push(refArr[0]);
                const circDep = seen.find(see => see === key)
                if (!!circDep) { throw new Error('Cyclical dependancy detected between ' + obj[key] + ' and ' + key) }

                // Placing into double array for simpler 
                return {...arr, ...{[key]: [[...obj[key], ...refArr]]}};
            }
        } else {
            return { ...arr, ...{ [key]: [obj[key]] } };
        }
    } else {
        return { ...arr, ...{ [key]: [obj[key]] } };
    }
}, {})


/* obj = {
	client: [[]],
	server: [[]],
	options: [['client'], ['server']],
	network: [['client', 'options'], ['server', 'options']],
    ajax: [['client', 'options', 'network']]
}; */

/* keys = ['client', 'network', 'options'] */

const any = xs => xs.reduce((acc, x) => acc || x, false)
const all = xs => xs.reduce((acc, x) => acc && x, true)

const bfs = (obj, keys) => {
    newObj = Object.keys(obj).reduce((arr, key) => {return {...arr, [key]: obj[key].map(arr => [...arr, key])}}, {})

    /*[
        { "client": [false] },
        { "server": [false] },
        { "options": [false, false] },
        { "network": [true, false] },
        { "ajax": [false] }
    ]*/
    const findMap = (arrComp = 'every', compareFn = ((arrLen, subArrLen) => arrLen < subArrLen)) =>
        ks.map(key => {
            return {
                [key]: obj[key].map(subArr => compareFn(keys.length, subArr.length) ?
                                                Array.prototype[arrComp].bind(subArr)(item => arr.find(find => find === item)) :
                                                false)
            }
        })


    match = findMap()
    matchChildren = findMap('some', (arrLen, subArrLen) => arrLen < subArrLen)




     const go = key => {
		seen.push(key);
		return (key in keys) && any(obj[key].map(opts => opts.filter(x => !(seen.find(x))).map(go)));
	}

	return all(keys.map(go));
}