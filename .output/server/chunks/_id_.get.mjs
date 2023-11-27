import { d as defineEventHandler, s as setResponseStatus } from './nitro/node-server.mjs';
import { p as prisma } from './index.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';
import '@prisma/client';

const _id__get = defineEventHandler(async (event) => {
  try {
    const id_produk = parseInt(event.context.params.id);
    const result = await prisma.produk.delete({
      where: { id_produk }
    });
    return result;
  } catch (error) {
    setResponseStatus(event, 404, "Data Not Found");
    return { error: true };
  }
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
