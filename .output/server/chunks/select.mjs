import { d as defineEventHandler } from './nitro/node-server.mjs';
import { p as prisma } from './index.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';
import '@prisma/client';

const select = defineEventHandler(async (event) => {
  const kategori = await prisma.kategori.findMany();
  const status = await prisma.status.findMany();
  var kategoriKey = {};
  var statusKey = {};
  kategori.forEach((item) => {
    kategoriKey[item.id_kategori] = item.nama_kategori;
  });
  status.forEach((item) => {
    statusKey[item.id_status] = item.nama_status;
  });
  return {
    kategori: kategori.map((item) => ({ title: item.nama_kategori, value: item.id_kategori })),
    status: status.map((item) => ({ title: item.nama_status, value: item.id_status })),
    kategoriKey,
    statusKey
  };
});

export { select as default };
//# sourceMappingURL=select.mjs.map
