function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function asyncValue(value) {
  try {
    await timeout(3000);
    console.log(value);
    return value;
  } catch (erro) {
    console.log('error');
  }
}

asyncValue('10');
