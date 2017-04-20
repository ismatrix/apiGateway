import createDebug from 'debug';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

const debug = createDebug('app:api:acls');
const logError = createDebug('app:api:acls:error');
logError.log = console.error.bind(console);

export async function getACLs() {
  try {
    const acls = await crud.acl.getList({}, { _id: 0 });
    debug('acls', acls);

    if (!acls) throw Boom.notFound('ACLs not found');

    return { ok: true, acls };
  } catch (error) {
    logError('getACLs(): %o', error);
    throw error;
  }
}
