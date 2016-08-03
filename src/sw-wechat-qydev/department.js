const debug = require('debug')('qydev:department');
import fetch from 'node-fetch';
import Boom from 'boom';

async function getDepartmentById(id) {
  try {
    const url = `${this.prefix}department/list?access_token=${this.accessToken}&id=${id}`;
    const departmentRes = await fetch(url).then(res => res.json());

    if (departmentRes.errcode !== 0) throw Boom.notFound('qydev department api errcode not null');

    return departmentRes.department;
  } catch (error) {
    debug(`getAccessToken() error: ${error}`);
    throw error;
  }
}

const department = {
  getDepartmentById,
};
export default department;
