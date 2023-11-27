import { u as useHead } from './index-6a088328.mjs';
import { defineComponent, ref, withAsyncContext, readonly, computed, resolveComponent, mergeProps, unref, withCtx, createTextVNode, createVNode, isRef, toDisplayString, useSSRContext, shallowRef, toRef, getCurrentInstance, onServerPrefetch, nextTick } from 'vue';
import { d as asyncDataDefaults, e as useNuxtApp, c as createError } from '../server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import '@unhead/shared';
import '../../nitro/node-server.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';
import 'unhead';
import 'vue-router';

function useAsyncData(...args) {
  var _a2, _b, _c, _d, _e, _f, _g, _h;
  var _a;
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  let [key, handler, options = {}] = args;
  if (typeof key !== "string") {
    throw new TypeError("[nuxt] [asyncData] key must be a string.");
  }
  if (typeof handler !== "function") {
    throw new TypeError("[nuxt] [asyncData] handler must be a function.");
  }
  const nuxt = useNuxtApp();
  const getDefault = () => null;
  const getDefaultCachedData = () => nuxt.isHydrating ? nuxt.payload.data[key] : nuxt.static.data[key];
  options.server = (_a2 = options.server) != null ? _a2 : true;
  options.default = (_b = options.default) != null ? _b : getDefault;
  options.getCachedData = (_c = options.getCachedData) != null ? _c : getDefaultCachedData;
  options.lazy = (_d = options.lazy) != null ? _d : false;
  options.immediate = (_e = options.immediate) != null ? _e : true;
  options.deep = (_f = options.deep) != null ? _f : asyncDataDefaults.deep;
  const hasCachedData = () => ![null, void 0].includes(options.getCachedData(key));
  if (!nuxt._asyncData[key] || !options.immediate) {
    (_g = (_a = nuxt.payload._errors)[key]) != null ? _g : _a[key] = null;
    const _ref = options.deep ? ref : shallowRef;
    nuxt._asyncData[key] = {
      data: _ref((_h = options.getCachedData(key)) != null ? _h : options.default()),
      pending: ref(!hasCachedData()),
      error: toRef(nuxt.payload._errors, key),
      status: ref("idle")
    };
  }
  const asyncData = { ...nuxt._asyncData[key] };
  asyncData.refresh = asyncData.execute = (opts = {}) => {
    if (nuxt._asyncDataPromises[key]) {
      if (opts.dedupe === false) {
        return nuxt._asyncDataPromises[key];
      }
      nuxt._asyncDataPromises[key].cancelled = true;
    }
    if ((opts._initial || nuxt.isHydrating && opts._initial !== false) && hasCachedData()) {
      return Promise.resolve(options.getCachedData(key));
    }
    asyncData.pending.value = true;
    asyncData.status.value = "pending";
    const promise = new Promise(
      (resolve, reject) => {
        try {
          resolve(handler(nuxt));
        } catch (err) {
          reject(err);
        }
      }
    ).then((_result) => {
      if (promise.cancelled) {
        return nuxt._asyncDataPromises[key];
      }
      let result = _result;
      if (options.transform) {
        result = options.transform(_result);
      }
      if (options.pick) {
        result = pick(result, options.pick);
      }
      nuxt.payload.data[key] = result;
      asyncData.data.value = result;
      asyncData.error.value = null;
      asyncData.status.value = "success";
    }).catch((error) => {
      if (promise.cancelled) {
        return nuxt._asyncDataPromises[key];
      }
      asyncData.error.value = createError(error);
      asyncData.data.value = unref(options.default());
      asyncData.status.value = "error";
    }).finally(() => {
      if (promise.cancelled) {
        return;
      }
      asyncData.pending.value = false;
      delete nuxt._asyncDataPromises[key];
    });
    nuxt._asyncDataPromises[key] = promise;
    return nuxt._asyncDataPromises[key];
  };
  const initialFetch = () => asyncData.refresh({ _initial: true });
  const fetchOnServer = options.server !== false && nuxt.payload.serverRendered;
  if (fetchOnServer && options.immediate) {
    const promise = initialFetch();
    if (getCurrentInstance()) {
      onServerPrefetch(() => promise);
    } else {
      nuxt.hook("app:created", async () => {
        await promise;
      });
    }
  }
  const asyncDataPromise = Promise.resolve(nuxt._asyncDataPromises[key]).then(() => asyncData);
  Object.assign(asyncDataPromise, asyncData);
  return asyncDataPromise;
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useHead({
      title: "Dashboard - FastPrint"
    });
    const allData = ref("false");
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("item", () => $fetch(`/api/produk?all=${allData.value}`))), __temp = await __temp, __restore(), __temp);
    const { data: selects } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("selects", () => $fetch("/api/select"))), __temp = await __temp, __restore(), __temp);
    const dialog = ref(false), dialogDelete = ref(false), headers = [
      readonly({
        title: "ID Produk",
        align: "start",
        sortable: false,
        key: "id_produk"
      }),
      readonly({ title: "Nama", key: "nama_produk", width: "35%" }),
      readonly({ title: "Harga", key: "harga" }),
      readonly({ title: "Kategori", key: "kategori.nama_kategori" }),
      readonly({ title: "Status", key: "status_label" }),
      readonly({ title: "Actions", key: "actions", sortable: false })
    ], editedIndex = ref(-1), editedItem = ref({
      id_produk: "",
      nama_produk: "",
      harga: 0,
      kategori_id: "",
      status_id: ""
    }), defaultItem = ref({
      id_produk: "",
      nama_produk: "",
      harga: 0,
      kategori_id: "",
      status_id: ""
    }), formTitle = computed(() => editedIndex.value === -1 ? "Tambah Produk" : "Edit Produk"), search = ref("");
    function editItem(item) {
      editedIndex.value = data.value.indexOf(item);
      editedItem.value = Object.assign({}, item);
      dialog.value = true;
    }
    function deleteItem(item) {
      editedIndex.value = data.value.indexOf(item);
      editedItem.value = Object.assign({}, item);
      dialogDelete.value = true;
    }
    async function deleteItemConfirm() {
      await $fetch(`/api/produk/delete/${editedItem.value.id_produk}`);
      data.value.splice(editedIndex.value, 1);
      closeDelete();
    }
    function close() {
      dialog.value = false;
      nextTick(() => {
        editedItem.value = Object.assign({}, defaultItem.value);
        editedIndex.value = -1;
      });
    }
    function closeDelete() {
      dialogDelete.value = false;
      nextTick(() => {
        editedItem.value = Object.assign({}, defaultItem.value);
        editedIndex.value = -1;
      });
    }
    async function save() {
      var _a;
      if (editedIndex.value > -1) {
        const response = await $fetch(`/api/produk/edit/${editedItem.value.id_produk}`, {
          method: "POST",
          body: editedItem.value
        });
        Object.assign(data.value[editedIndex.value], response);
      } else {
        const response = await $fetch("/api/produk/create", {
          method: "POST",
          body: editedItem.value
        });
        (_a = data.value) == null ? void 0 : _a.push(response);
      }
      close();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_v_data_table = resolveComponent("v-data-table");
      const _component_v_toolbar = resolveComponent("v-toolbar");
      const _component_v_toolbar_title = resolveComponent("v-toolbar-title");
      const _component_v_icon = resolveComponent("v-icon");
      const _component_v_select = resolveComponent("v-select");
      const _component_v_divider = resolveComponent("v-divider");
      const _component_v_spacer = resolveComponent("v-spacer");
      const _component_v_text_field = resolveComponent("v-text-field");
      const _component_v_dialog = resolveComponent("v-dialog");
      const _component_v_btn = resolveComponent("v-btn");
      const _component_v_card = resolveComponent("v-card");
      const _component_v_card_title = resolveComponent("v-card-title");
      const _component_v_card_text = resolveComponent("v-card-text");
      const _component_v_container = resolveComponent("v-container");
      const _component_v_row = resolveComponent("v-row");
      const _component_v_col = resolveComponent("v-col");
      const _component_v_card_actions = resolveComponent("v-card-actions");
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "padding": "1rem" } }, _attrs))}>`);
      _push(ssrRenderComponent(_component_v_data_table, {
        headers,
        items: unref(data),
        search: unref(search),
        "sort-by": [{ key: "nama_produk", order: "asc" }]
      }, {
        top: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_v_toolbar, { flat: "" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_v_toolbar_title, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`List Produk `);
                        _push4(ssrRenderComponent(_component_v_icon, {
                          size: "small",
                          onClick: ($event) => unref(refresh)()
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` mdi-refresh `);
                            } else {
                              return [
                                createTextVNode(" mdi-refresh ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createTextVNode("List Produk "),
                          createVNode(_component_v_icon, {
                            size: "small",
                            onClick: ($event) => unref(refresh)()
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" mdi-refresh ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_v_select, {
                    label: "Status",
                    style: { "display": "inline-flex" },
                    "item-text": "title",
                    "item-value": "value",
                    modelValue: unref(allData),
                    "onUpdate:modelValue": [($event) => isRef(allData) ? allData.value = $event : null, ($event) => unref(refresh)()],
                    items: [{ title: "Bisa Dijual", value: "false" }, { title: "Semua", value: "true" }],
                    variant: "outlined",
                    density: "compact"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_v_divider, {
                    class: "mx-4",
                    inset: "",
                    vertical: ""
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_v_spacer, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_v_text_field, {
                    density: "compact",
                    variant: "solo",
                    label: "Cari Produk",
                    "append-inner-icon": "mdi-magnify",
                    "single-line": "",
                    "hide-details": "",
                    modelValue: unref(search),
                    "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_v_dialog, {
                    modelValue: unref(dialog),
                    "onUpdate:modelValue": ($event) => isRef(dialog) ? dialog.value = $event : null,
                    "max-width": "500px"
                  }, {
                    activator: withCtx(({ props }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_v_btn, mergeProps({
                          color: "primary",
                          dark: "",
                          class: "mb-2"
                        }, props), {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` Tambah Produk `);
                            } else {
                              return [
                                createTextVNode(" Tambah Produk ")
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_v_btn, mergeProps({
                            color: "primary",
                            dark: "",
                            class: "mb-2"
                          }, props), {
                            default: withCtx(() => [
                              createTextVNode(" Tambah Produk ")
                            ]),
                            _: 2
                          }, 1040)
                        ];
                      }
                    }),
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_v_card, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_v_card_title, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`<span class="text-h5"${_scopeId5}>${ssrInterpolate(unref(formTitle))}</span>`);
                                  } else {
                                    return [
                                      createVNode("span", { class: "text-h5" }, toDisplayString(unref(formTitle)), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_v_card_text, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_v_container, null, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(_component_v_row, null, {
                                            default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                              if (_push8) {
                                                _push8(ssrRenderComponent(_component_v_col, { cols: "12" }, {
                                                  default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                    if (_push9) {
                                                      _push9(ssrRenderComponent(_component_v_text_field, {
                                                        modelValue: unref(editedItem).nama_produk,
                                                        "onUpdate:modelValue": ($event) => unref(editedItem).nama_produk = $event,
                                                        label: "Nama Produk*",
                                                        required: ""
                                                      }, null, _parent9, _scopeId8));
                                                    } else {
                                                      return [
                                                        createVNode(_component_v_text_field, {
                                                          modelValue: unref(editedItem).nama_produk,
                                                          "onUpdate:modelValue": ($event) => unref(editedItem).nama_produk = $event,
                                                          label: "Nama Produk*",
                                                          required: ""
                                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                      ];
                                                    }
                                                  }),
                                                  _: 1
                                                }, _parent8, _scopeId7));
                                                _push8(ssrRenderComponent(_component_v_col, {
                                                  cols: "12",
                                                  sm: "6"
                                                }, {
                                                  default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                    if (_push9) {
                                                      _push9(ssrRenderComponent(_component_v_text_field, {
                                                        modelValue: unref(editedItem).harga,
                                                        "onUpdate:modelValue": ($event) => unref(editedItem).harga = $event,
                                                        label: "Harga*",
                                                        type: "number",
                                                        step: "500",
                                                        required: ""
                                                      }, null, _parent9, _scopeId8));
                                                    } else {
                                                      return [
                                                        createVNode(_component_v_text_field, {
                                                          modelValue: unref(editedItem).harga,
                                                          "onUpdate:modelValue": ($event) => unref(editedItem).harga = $event,
                                                          label: "Harga*",
                                                          type: "number",
                                                          step: "500",
                                                          required: ""
                                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                      ];
                                                    }
                                                  }),
                                                  _: 1
                                                }, _parent8, _scopeId7));
                                                _push8(ssrRenderComponent(_component_v_col, {
                                                  cols: "12",
                                                  sm: "6"
                                                }, {
                                                  default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                    if (_push9) {
                                                      _push9(ssrRenderComponent(_component_v_select, {
                                                        label: "Status*",
                                                        "item-text": "title",
                                                        "item-value": "value",
                                                        modelValue: unref(editedItem).status_id,
                                                        "onUpdate:modelValue": ($event) => unref(editedItem).status_id = $event,
                                                        items: unref(selects).status || [],
                                                        variant: "outlined",
                                                        required: ""
                                                      }, null, _parent9, _scopeId8));
                                                    } else {
                                                      return [
                                                        createVNode(_component_v_select, {
                                                          label: "Status*",
                                                          "item-text": "title",
                                                          "item-value": "value",
                                                          modelValue: unref(editedItem).status_id,
                                                          "onUpdate:modelValue": ($event) => unref(editedItem).status_id = $event,
                                                          items: unref(selects).status || [],
                                                          variant: "outlined",
                                                          required: ""
                                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                                      ];
                                                    }
                                                  }),
                                                  _: 1
                                                }, _parent8, _scopeId7));
                                                _push8(ssrRenderComponent(_component_v_col, { cols: "12" }, {
                                                  default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                    if (_push9) {
                                                      _push9(ssrRenderComponent(_component_v_select, {
                                                        label: "Kategori*",
                                                        "item-text": "title",
                                                        "item-value": "value",
                                                        modelValue: unref(editedItem).kategori_id,
                                                        "onUpdate:modelValue": ($event) => unref(editedItem).kategori_id = $event,
                                                        items: unref(selects).kategori || [],
                                                        variant: "outlined",
                                                        required: ""
                                                      }, null, _parent9, _scopeId8));
                                                    } else {
                                                      return [
                                                        createVNode(_component_v_select, {
                                                          label: "Kategori*",
                                                          "item-text": "title",
                                                          "item-value": "value",
                                                          modelValue: unref(editedItem).kategori_id,
                                                          "onUpdate:modelValue": ($event) => unref(editedItem).kategori_id = $event,
                                                          items: unref(selects).kategori || [],
                                                          variant: "outlined",
                                                          required: ""
                                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                                      ];
                                                    }
                                                  }),
                                                  _: 1
                                                }, _parent8, _scopeId7));
                                              } else {
                                                return [
                                                  createVNode(_component_v_col, { cols: "12" }, {
                                                    default: withCtx(() => [
                                                      createVNode(_component_v_text_field, {
                                                        modelValue: unref(editedItem).nama_produk,
                                                        "onUpdate:modelValue": ($event) => unref(editedItem).nama_produk = $event,
                                                        label: "Nama Produk*",
                                                        required: ""
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    _: 1
                                                  }),
                                                  createVNode(_component_v_col, {
                                                    cols: "12",
                                                    sm: "6"
                                                  }, {
                                                    default: withCtx(() => [
                                                      createVNode(_component_v_text_field, {
                                                        modelValue: unref(editedItem).harga,
                                                        "onUpdate:modelValue": ($event) => unref(editedItem).harga = $event,
                                                        label: "Harga*",
                                                        type: "number",
                                                        step: "500",
                                                        required: ""
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    _: 1
                                                  }),
                                                  createVNode(_component_v_col, {
                                                    cols: "12",
                                                    sm: "6"
                                                  }, {
                                                    default: withCtx(() => [
                                                      createVNode(_component_v_select, {
                                                        label: "Status*",
                                                        "item-text": "title",
                                                        "item-value": "value",
                                                        modelValue: unref(editedItem).status_id,
                                                        "onUpdate:modelValue": ($event) => unref(editedItem).status_id = $event,
                                                        items: unref(selects).status || [],
                                                        variant: "outlined",
                                                        required: ""
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                                    ]),
                                                    _: 1
                                                  }),
                                                  createVNode(_component_v_col, { cols: "12" }, {
                                                    default: withCtx(() => [
                                                      createVNode(_component_v_select, {
                                                        label: "Kategori*",
                                                        "item-text": "title",
                                                        "item-value": "value",
                                                        modelValue: unref(editedItem).kategori_id,
                                                        "onUpdate:modelValue": ($event) => unref(editedItem).kategori_id = $event,
                                                        items: unref(selects).kategori || [],
                                                        variant: "outlined",
                                                        required: ""
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                                    ]),
                                                    _: 1
                                                  })
                                                ];
                                              }
                                            }),
                                            _: 1
                                          }, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(_component_v_row, null, {
                                              default: withCtx(() => [
                                                createVNode(_component_v_col, { cols: "12" }, {
                                                  default: withCtx(() => [
                                                    createVNode(_component_v_text_field, {
                                                      modelValue: unref(editedItem).nama_produk,
                                                      "onUpdate:modelValue": ($event) => unref(editedItem).nama_produk = $event,
                                                      label: "Nama Produk*",
                                                      required: ""
                                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                  ]),
                                                  _: 1
                                                }),
                                                createVNode(_component_v_col, {
                                                  cols: "12",
                                                  sm: "6"
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode(_component_v_text_field, {
                                                      modelValue: unref(editedItem).harga,
                                                      "onUpdate:modelValue": ($event) => unref(editedItem).harga = $event,
                                                      label: "Harga*",
                                                      type: "number",
                                                      step: "500",
                                                      required: ""
                                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                  ]),
                                                  _: 1
                                                }),
                                                createVNode(_component_v_col, {
                                                  cols: "12",
                                                  sm: "6"
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode(_component_v_select, {
                                                      label: "Status*",
                                                      "item-text": "title",
                                                      "item-value": "value",
                                                      modelValue: unref(editedItem).status_id,
                                                      "onUpdate:modelValue": ($event) => unref(editedItem).status_id = $event,
                                                      items: unref(selects).status || [],
                                                      variant: "outlined",
                                                      required: ""
                                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                                  ]),
                                                  _: 1
                                                }),
                                                createVNode(_component_v_col, { cols: "12" }, {
                                                  default: withCtx(() => [
                                                    createVNode(_component_v_select, {
                                                      label: "Kategori*",
                                                      "item-text": "title",
                                                      "item-value": "value",
                                                      modelValue: unref(editedItem).kategori_id,
                                                      "onUpdate:modelValue": ($event) => unref(editedItem).kategori_id = $event,
                                                      items: unref(selects).kategori || [],
                                                      variant: "outlined",
                                                      required: ""
                                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                                  ]),
                                                  _: 1
                                                })
                                              ]),
                                              _: 1
                                            })
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_v_container, null, {
                                        default: withCtx(() => [
                                          createVNode(_component_v_row, null, {
                                            default: withCtx(() => [
                                              createVNode(_component_v_col, { cols: "12" }, {
                                                default: withCtx(() => [
                                                  createVNode(_component_v_text_field, {
                                                    modelValue: unref(editedItem).nama_produk,
                                                    "onUpdate:modelValue": ($event) => unref(editedItem).nama_produk = $event,
                                                    label: "Nama Produk*",
                                                    required: ""
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                _: 1
                                              }),
                                              createVNode(_component_v_col, {
                                                cols: "12",
                                                sm: "6"
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode(_component_v_text_field, {
                                                    modelValue: unref(editedItem).harga,
                                                    "onUpdate:modelValue": ($event) => unref(editedItem).harga = $event,
                                                    label: "Harga*",
                                                    type: "number",
                                                    step: "500",
                                                    required: ""
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                _: 1
                                              }),
                                              createVNode(_component_v_col, {
                                                cols: "12",
                                                sm: "6"
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode(_component_v_select, {
                                                    label: "Status*",
                                                    "item-text": "title",
                                                    "item-value": "value",
                                                    modelValue: unref(editedItem).status_id,
                                                    "onUpdate:modelValue": ($event) => unref(editedItem).status_id = $event,
                                                    items: unref(selects).status || [],
                                                    variant: "outlined",
                                                    required: ""
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                                ]),
                                                _: 1
                                              }),
                                              createVNode(_component_v_col, { cols: "12" }, {
                                                default: withCtx(() => [
                                                  createVNode(_component_v_select, {
                                                    label: "Kategori*",
                                                    "item-text": "title",
                                                    "item-value": "value",
                                                    modelValue: unref(editedItem).kategori_id,
                                                    "onUpdate:modelValue": ($event) => unref(editedItem).kategori_id = $event,
                                                    items: unref(selects).kategori || [],
                                                    variant: "outlined",
                                                    required: ""
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                                ]),
                                                _: 1
                                              })
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_v_card_actions, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_v_spacer, null, null, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(_component_v_btn, {
                                      color: "blue-darken-1",
                                      variant: "text",
                                      onClick: close
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(` Cancel `);
                                        } else {
                                          return [
                                            createTextVNode(" Cancel ")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(_component_v_btn, {
                                      color: "blue-darken-1",
                                      variant: "text",
                                      onClick: save
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(` Save `);
                                        } else {
                                          return [
                                            createTextVNode(" Save ")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_v_spacer),
                                      createVNode(_component_v_btn, {
                                        color: "blue-darken-1",
                                        variant: "text",
                                        onClick: close
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(" Cancel ")
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(_component_v_btn, {
                                        color: "blue-darken-1",
                                        variant: "text",
                                        onClick: save
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(" Save ")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_v_card_title, null, {
                                  default: withCtx(() => [
                                    createVNode("span", { class: "text-h5" }, toDisplayString(unref(formTitle)), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_v_card_text, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_v_container, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_v_row, null, {
                                          default: withCtx(() => [
                                            createVNode(_component_v_col, { cols: "12" }, {
                                              default: withCtx(() => [
                                                createVNode(_component_v_text_field, {
                                                  modelValue: unref(editedItem).nama_produk,
                                                  "onUpdate:modelValue": ($event) => unref(editedItem).nama_produk = $event,
                                                  label: "Nama Produk*",
                                                  required: ""
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              _: 1
                                            }),
                                            createVNode(_component_v_col, {
                                              cols: "12",
                                              sm: "6"
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(_component_v_text_field, {
                                                  modelValue: unref(editedItem).harga,
                                                  "onUpdate:modelValue": ($event) => unref(editedItem).harga = $event,
                                                  label: "Harga*",
                                                  type: "number",
                                                  step: "500",
                                                  required: ""
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              _: 1
                                            }),
                                            createVNode(_component_v_col, {
                                              cols: "12",
                                              sm: "6"
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(_component_v_select, {
                                                  label: "Status*",
                                                  "item-text": "title",
                                                  "item-value": "value",
                                                  modelValue: unref(editedItem).status_id,
                                                  "onUpdate:modelValue": ($event) => unref(editedItem).status_id = $event,
                                                  items: unref(selects).status || [],
                                                  variant: "outlined",
                                                  required: ""
                                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                              ]),
                                              _: 1
                                            }),
                                            createVNode(_component_v_col, { cols: "12" }, {
                                              default: withCtx(() => [
                                                createVNode(_component_v_select, {
                                                  label: "Kategori*",
                                                  "item-text": "title",
                                                  "item-value": "value",
                                                  modelValue: unref(editedItem).kategori_id,
                                                  "onUpdate:modelValue": ($event) => unref(editedItem).kategori_id = $event,
                                                  items: unref(selects).kategori || [],
                                                  variant: "outlined",
                                                  required: ""
                                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                              ]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_v_card_actions, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_v_spacer),
                                    createVNode(_component_v_btn, {
                                      color: "blue-darken-1",
                                      variant: "text",
                                      onClick: close
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(" Cancel ")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_v_btn, {
                                      color: "blue-darken-1",
                                      variant: "text",
                                      onClick: save
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(" Save ")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_v_card, null, {
                            default: withCtx(() => [
                              createVNode(_component_v_card_title, null, {
                                default: withCtx(() => [
                                  createVNode("span", { class: "text-h5" }, toDisplayString(unref(formTitle)), 1)
                                ]),
                                _: 1
                              }),
                              createVNode(_component_v_card_text, null, {
                                default: withCtx(() => [
                                  createVNode(_component_v_container, null, {
                                    default: withCtx(() => [
                                      createVNode(_component_v_row, null, {
                                        default: withCtx(() => [
                                          createVNode(_component_v_col, { cols: "12" }, {
                                            default: withCtx(() => [
                                              createVNode(_component_v_text_field, {
                                                modelValue: unref(editedItem).nama_produk,
                                                "onUpdate:modelValue": ($event) => unref(editedItem).nama_produk = $event,
                                                label: "Nama Produk*",
                                                required: ""
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            _: 1
                                          }),
                                          createVNode(_component_v_col, {
                                            cols: "12",
                                            sm: "6"
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(_component_v_text_field, {
                                                modelValue: unref(editedItem).harga,
                                                "onUpdate:modelValue": ($event) => unref(editedItem).harga = $event,
                                                label: "Harga*",
                                                type: "number",
                                                step: "500",
                                                required: ""
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            _: 1
                                          }),
                                          createVNode(_component_v_col, {
                                            cols: "12",
                                            sm: "6"
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(_component_v_select, {
                                                label: "Status*",
                                                "item-text": "title",
                                                "item-value": "value",
                                                modelValue: unref(editedItem).status_id,
                                                "onUpdate:modelValue": ($event) => unref(editedItem).status_id = $event,
                                                items: unref(selects).status || [],
                                                variant: "outlined",
                                                required: ""
                                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                            ]),
                                            _: 1
                                          }),
                                          createVNode(_component_v_col, { cols: "12" }, {
                                            default: withCtx(() => [
                                              createVNode(_component_v_select, {
                                                label: "Kategori*",
                                                "item-text": "title",
                                                "item-value": "value",
                                                modelValue: unref(editedItem).kategori_id,
                                                "onUpdate:modelValue": ($event) => unref(editedItem).kategori_id = $event,
                                                items: unref(selects).kategori || [],
                                                variant: "outlined",
                                                required: ""
                                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(_component_v_card_actions, null, {
                                default: withCtx(() => [
                                  createVNode(_component_v_spacer),
                                  createVNode(_component_v_btn, {
                                    color: "blue-darken-1",
                                    variant: "text",
                                    onClick: close
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Cancel ")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_v_btn, {
                                    color: "blue-darken-1",
                                    variant: "text",
                                    onClick: save
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Save ")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_v_dialog, {
                    modelValue: unref(dialogDelete),
                    "onUpdate:modelValue": ($event) => isRef(dialogDelete) ? dialogDelete.value = $event : null,
                    "max-width": "500px"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_v_card, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_v_card_title, { class: "text-h5" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`Are you sure you want to delete this item?`);
                                  } else {
                                    return [
                                      createTextVNode("Are you sure you want to delete this item?")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_v_card_actions, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_v_spacer, null, null, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(_component_v_btn, {
                                      color: "blue-darken-1",
                                      variant: "text",
                                      onClick: closeDelete
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`Cancel`);
                                        } else {
                                          return [
                                            createTextVNode("Cancel")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(_component_v_btn, {
                                      color: "blue-darken-1",
                                      variant: "text",
                                      onClick: deleteItemConfirm
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`OK`);
                                        } else {
                                          return [
                                            createTextVNode("OK")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(_component_v_spacer, null, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_v_spacer),
                                      createVNode(_component_v_btn, {
                                        color: "blue-darken-1",
                                        variant: "text",
                                        onClick: closeDelete
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("Cancel")
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(_component_v_btn, {
                                        color: "blue-darken-1",
                                        variant: "text",
                                        onClick: deleteItemConfirm
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("OK")
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(_component_v_spacer)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_v_card_title, { class: "text-h5" }, {
                                  default: withCtx(() => [
                                    createTextVNode("Are you sure you want to delete this item?")
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_v_card_actions, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_v_spacer),
                                    createVNode(_component_v_btn, {
                                      color: "blue-darken-1",
                                      variant: "text",
                                      onClick: closeDelete
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("Cancel")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_v_btn, {
                                      color: "blue-darken-1",
                                      variant: "text",
                                      onClick: deleteItemConfirm
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("OK")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_v_spacer)
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_v_card, null, {
                            default: withCtx(() => [
                              createVNode(_component_v_card_title, { class: "text-h5" }, {
                                default: withCtx(() => [
                                  createTextVNode("Are you sure you want to delete this item?")
                                ]),
                                _: 1
                              }),
                              createVNode(_component_v_card_actions, null, {
                                default: withCtx(() => [
                                  createVNode(_component_v_spacer),
                                  createVNode(_component_v_btn, {
                                    color: "blue-darken-1",
                                    variant: "text",
                                    onClick: closeDelete
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Cancel")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_v_btn, {
                                    color: "blue-darken-1",
                                    variant: "text",
                                    onClick: deleteItemConfirm
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("OK")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_v_spacer)
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_v_toolbar_title, null, {
                      default: withCtx(() => [
                        createTextVNode("List Produk "),
                        createVNode(_component_v_icon, {
                          size: "small",
                          onClick: ($event) => unref(refresh)()
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" mdi-refresh ")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_v_select, {
                      label: "Status",
                      style: { "display": "inline-flex" },
                      "item-text": "title",
                      "item-value": "value",
                      modelValue: unref(allData),
                      "onUpdate:modelValue": [($event) => isRef(allData) ? allData.value = $event : null, ($event) => unref(refresh)()],
                      items: [{ title: "Bisa Dijual", value: "false" }, { title: "Semua", value: "true" }],
                      variant: "outlined",
                      density: "compact"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_v_divider, {
                      class: "mx-4",
                      inset: "",
                      vertical: ""
                    }),
                    createVNode(_component_v_spacer),
                    createVNode(_component_v_text_field, {
                      density: "compact",
                      variant: "solo",
                      label: "Cari Produk",
                      "append-inner-icon": "mdi-magnify",
                      "single-line": "",
                      "hide-details": "",
                      modelValue: unref(search),
                      "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_v_dialog, {
                      modelValue: unref(dialog),
                      "onUpdate:modelValue": ($event) => isRef(dialog) ? dialog.value = $event : null,
                      "max-width": "500px"
                    }, {
                      activator: withCtx(({ props }) => [
                        createVNode(_component_v_btn, mergeProps({
                          color: "primary",
                          dark: "",
                          class: "mb-2"
                        }, props), {
                          default: withCtx(() => [
                            createTextVNode(" Tambah Produk ")
                          ]),
                          _: 2
                        }, 1040)
                      ]),
                      default: withCtx(() => [
                        createVNode(_component_v_card, null, {
                          default: withCtx(() => [
                            createVNode(_component_v_card_title, null, {
                              default: withCtx(() => [
                                createVNode("span", { class: "text-h5" }, toDisplayString(unref(formTitle)), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_v_card_text, null, {
                              default: withCtx(() => [
                                createVNode(_component_v_container, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_v_row, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_v_col, { cols: "12" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_v_text_field, {
                                              modelValue: unref(editedItem).nama_produk,
                                              "onUpdate:modelValue": ($event) => unref(editedItem).nama_produk = $event,
                                              label: "Nama Produk*",
                                              required: ""
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(_component_v_col, {
                                          cols: "12",
                                          sm: "6"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(_component_v_text_field, {
                                              modelValue: unref(editedItem).harga,
                                              "onUpdate:modelValue": ($event) => unref(editedItem).harga = $event,
                                              label: "Harga*",
                                              type: "number",
                                              step: "500",
                                              required: ""
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(_component_v_col, {
                                          cols: "12",
                                          sm: "6"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(_component_v_select, {
                                              label: "Status*",
                                              "item-text": "title",
                                              "item-value": "value",
                                              modelValue: unref(editedItem).status_id,
                                              "onUpdate:modelValue": ($event) => unref(editedItem).status_id = $event,
                                              items: unref(selects).status || [],
                                              variant: "outlined",
                                              required: ""
                                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(_component_v_col, { cols: "12" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_v_select, {
                                              label: "Kategori*",
                                              "item-text": "title",
                                              "item-value": "value",
                                              modelValue: unref(editedItem).kategori_id,
                                              "onUpdate:modelValue": ($event) => unref(editedItem).kategori_id = $event,
                                              items: unref(selects).kategori || [],
                                              variant: "outlined",
                                              required: ""
                                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode(_component_v_card_actions, null, {
                              default: withCtx(() => [
                                createVNode(_component_v_spacer),
                                createVNode(_component_v_btn, {
                                  color: "blue-darken-1",
                                  variant: "text",
                                  onClick: close
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Cancel ")
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_v_btn, {
                                  color: "blue-darken-1",
                                  variant: "text",
                                  onClick: save
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Save ")
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_v_dialog, {
                      modelValue: unref(dialogDelete),
                      "onUpdate:modelValue": ($event) => isRef(dialogDelete) ? dialogDelete.value = $event : null,
                      "max-width": "500px"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_v_card, null, {
                          default: withCtx(() => [
                            createVNode(_component_v_card_title, { class: "text-h5" }, {
                              default: withCtx(() => [
                                createTextVNode("Are you sure you want to delete this item?")
                              ]),
                              _: 1
                            }),
                            createVNode(_component_v_card_actions, null, {
                              default: withCtx(() => [
                                createVNode(_component_v_spacer),
                                createVNode(_component_v_btn, {
                                  color: "blue-darken-1",
                                  variant: "text",
                                  onClick: closeDelete
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Cancel")
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_v_btn, {
                                  color: "blue-darken-1",
                                  variant: "text",
                                  onClick: deleteItemConfirm
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("OK")
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_v_spacer)
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_v_toolbar, { flat: "" }, {
                default: withCtx(() => [
                  createVNode(_component_v_toolbar_title, null, {
                    default: withCtx(() => [
                      createTextVNode("List Produk "),
                      createVNode(_component_v_icon, {
                        size: "small",
                        onClick: ($event) => unref(refresh)()
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" mdi-refresh ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_v_select, {
                    label: "Status",
                    style: { "display": "inline-flex" },
                    "item-text": "title",
                    "item-value": "value",
                    modelValue: unref(allData),
                    "onUpdate:modelValue": [($event) => isRef(allData) ? allData.value = $event : null, ($event) => unref(refresh)()],
                    items: [{ title: "Bisa Dijual", value: "false" }, { title: "Semua", value: "true" }],
                    variant: "outlined",
                    density: "compact"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_v_divider, {
                    class: "mx-4",
                    inset: "",
                    vertical: ""
                  }),
                  createVNode(_component_v_spacer),
                  createVNode(_component_v_text_field, {
                    density: "compact",
                    variant: "solo",
                    label: "Cari Produk",
                    "append-inner-icon": "mdi-magnify",
                    "single-line": "",
                    "hide-details": "",
                    modelValue: unref(search),
                    "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_v_dialog, {
                    modelValue: unref(dialog),
                    "onUpdate:modelValue": ($event) => isRef(dialog) ? dialog.value = $event : null,
                    "max-width": "500px"
                  }, {
                    activator: withCtx(({ props }) => [
                      createVNode(_component_v_btn, mergeProps({
                        color: "primary",
                        dark: "",
                        class: "mb-2"
                      }, props), {
                        default: withCtx(() => [
                          createTextVNode(" Tambah Produk ")
                        ]),
                        _: 2
                      }, 1040)
                    ]),
                    default: withCtx(() => [
                      createVNode(_component_v_card, null, {
                        default: withCtx(() => [
                          createVNode(_component_v_card_title, null, {
                            default: withCtx(() => [
                              createVNode("span", { class: "text-h5" }, toDisplayString(unref(formTitle)), 1)
                            ]),
                            _: 1
                          }),
                          createVNode(_component_v_card_text, null, {
                            default: withCtx(() => [
                              createVNode(_component_v_container, null, {
                                default: withCtx(() => [
                                  createVNode(_component_v_row, null, {
                                    default: withCtx(() => [
                                      createVNode(_component_v_col, { cols: "12" }, {
                                        default: withCtx(() => [
                                          createVNode(_component_v_text_field, {
                                            modelValue: unref(editedItem).nama_produk,
                                            "onUpdate:modelValue": ($event) => unref(editedItem).nama_produk = $event,
                                            label: "Nama Produk*",
                                            required: ""
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(_component_v_col, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(_component_v_text_field, {
                                            modelValue: unref(editedItem).harga,
                                            "onUpdate:modelValue": ($event) => unref(editedItem).harga = $event,
                                            label: "Harga*",
                                            type: "number",
                                            step: "500",
                                            required: ""
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(_component_v_col, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(_component_v_select, {
                                            label: "Status*",
                                            "item-text": "title",
                                            "item-value": "value",
                                            modelValue: unref(editedItem).status_id,
                                            "onUpdate:modelValue": ($event) => unref(editedItem).status_id = $event,
                                            items: unref(selects).status || [],
                                            variant: "outlined",
                                            required: ""
                                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(_component_v_col, { cols: "12" }, {
                                        default: withCtx(() => [
                                          createVNode(_component_v_select, {
                                            label: "Kategori*",
                                            "item-text": "title",
                                            "item-value": "value",
                                            modelValue: unref(editedItem).kategori_id,
                                            "onUpdate:modelValue": ($event) => unref(editedItem).kategori_id = $event,
                                            items: unref(selects).kategori || [],
                                            variant: "outlined",
                                            required: ""
                                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(_component_v_card_actions, null, {
                            default: withCtx(() => [
                              createVNode(_component_v_spacer),
                              createVNode(_component_v_btn, {
                                color: "blue-darken-1",
                                variant: "text",
                                onClick: close
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" Cancel ")
                                ]),
                                _: 1
                              }),
                              createVNode(_component_v_btn, {
                                color: "blue-darken-1",
                                variant: "text",
                                onClick: save
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" Save ")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_v_dialog, {
                    modelValue: unref(dialogDelete),
                    "onUpdate:modelValue": ($event) => isRef(dialogDelete) ? dialogDelete.value = $event : null,
                    "max-width": "500px"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_v_card, null, {
                        default: withCtx(() => [
                          createVNode(_component_v_card_title, { class: "text-h5" }, {
                            default: withCtx(() => [
                              createTextVNode("Are you sure you want to delete this item?")
                            ]),
                            _: 1
                          }),
                          createVNode(_component_v_card_actions, null, {
                            default: withCtx(() => [
                              createVNode(_component_v_spacer),
                              createVNode(_component_v_btn, {
                                color: "blue-darken-1",
                                variant: "text",
                                onClick: closeDelete
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Cancel")
                                ]),
                                _: 1
                              }),
                              createVNode(_component_v_btn, {
                                color: "blue-darken-1",
                                variant: "text",
                                onClick: deleteItemConfirm
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("OK")
                                ]),
                                _: 1
                              }),
                              createVNode(_component_v_spacer)
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                _: 1
              })
            ];
          }
        }),
        "item.actions": withCtx(({ item }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_v_icon, {
              size: "small",
              class: "me-2",
              onClick: ($event) => editItem(item)
            }, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` mdi-pencil `);
                } else {
                  return [
                    createTextVNode(" mdi-pencil ")
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_v_icon, {
              size: "small",
              onClick: ($event) => deleteItem(item)
            }, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` mdi-delete `);
                } else {
                  return [
                    createTextVNode(" mdi-delete ")
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_v_icon, {
                size: "small",
                class: "me-2",
                onClick: ($event) => editItem(item)
              }, {
                default: withCtx(() => [
                  createTextVNode(" mdi-pencil ")
                ]),
                _: 2
              }, 1032, ["onClick"]),
              createVNode(_component_v_icon, {
                size: "small",
                onClick: ($event) => deleteItem(item)
              }, {
                default: withCtx(() => [
                  createTextVNode(" mdi-delete ")
                ]),
                _: 2
              }, 1032, ["onClick"])
            ];
          }
        }),
        "item.kategori_label": withCtx(({ item }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>${ssrInterpolate(unref(selects).kategoriKey[item.kategori_id])}</span>`);
          } else {
            return [
              createVNode("span", null, toDisplayString(unref(selects).kategoriKey[item.kategori_id]), 1)
            ];
          }
        }),
        "item.status_label": withCtx(({ item }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>${ssrInterpolate(unref(selects).statusKey[item.status_id])}</span>`);
          } else {
            return [
              createVNode("span", null, toDisplayString(unref(selects).statusKey[item.status_id]), 1)
            ];
          }
        }),
        "no-data": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3${_scopeId}>No Data Found</h3>`);
          } else {
            return [
              createVNode("h3", null, "No Data Found")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-ffd76950.mjs.map
