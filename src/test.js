async function asyncValue(value) {
  try {
    await setTimeout(() => console.log('end timeout'), 10000);
    console.log(value);
    return value;
  } catch (erro) {
    console.log('error');
  }
}
console.log(asyncValue('10'));
