const isObject = (value: any): boolean => value && typeof value === 'object' && value.constructor === Object;

export const merge = <TOldObj, TNewObj>(oldObj: TOldObj, newObj: TNewObj): TOldObj & TNewObj => {
  const allKeys = [
    ...Object.keys(newObj),
    ...Object.keys(oldObj)
  ];

  return <TOldObj & TNewObj>allKeys.reduce((prev, key) => {
    if (isObject(oldObj[key]) && isObject(newObj[key])) {
      return {...prev, [key]: merge(oldObj[key], newObj[key])};
    } else if (Array.isArray(oldObj[key]) && Array.isArray(newObj[key])) {
      return {...prev, [key]: [...oldObj[key], ...newObj[key]]};
    }

    const oldHasKey = Object.getOwnPropertyNames(oldObj).includes(key);
    const newHasKey = Object.getOwnPropertyNames(oldObj).includes(key);
    if ((oldHasKey && !newHasKey) || (oldHasKey && newHasKey && newObj[key] === undefined)) {
      return {...prev, [key]: oldObj[key]};
    } else {
      return {...prev, [key]: newObj[key]}
    }
  }, {});
};
