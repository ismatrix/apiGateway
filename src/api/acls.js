import Boom from 'boom';
import crud from 'sw-mongodb-crud';
import logger from 'sw-common';


export async function getACLs() {
  try {
    const acls = await crud.acl.getList({}, { _id: 0 });
    logger.info('acls', acls);

    if (!acls) throw Boom.notFound('ACLs not found');

    return { ok: true, acls };
  } catch (error) {
    logger.error('getACLs(): %j', error);
    throw error;
  }
}
