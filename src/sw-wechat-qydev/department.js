const debug = require('debug')('qydev:department');
import fetch from 'node-fetch';


async function getDepartmentById(id) {
  try {
    const url = `${this.prefix}department/list?access_token=${this.accessToken}&id=${id}`;
    const department = await fetch(url).then(res => res.json());
    return department;
  } catch (error) {
    debug(`getAccessToken() error: ${error}`);
  }
}

const department = {
  getDepartmentById,
};
export default department;
