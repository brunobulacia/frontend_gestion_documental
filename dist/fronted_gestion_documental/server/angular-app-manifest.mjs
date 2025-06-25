
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {},
  assets: {
    'index.csr.html': {size: 1971, hash: '31204e21b8d52bf502b2b5ebf323f565d8730678adbe027c1782c679e9421794', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1527, hash: 'c9ded72f22eac4213f28e16828a2096c09971851f8d31a674479823c730ebfcd', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-DDHKQKLO.css': {size: 4713, hash: 'xDqRL8T1QrI', text: () => import('./assets-chunks/styles-DDHKQKLO_css.mjs').then(m => m.default)}
  },
};
