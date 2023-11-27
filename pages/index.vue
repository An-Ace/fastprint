<template>
  <div style="padding: 1rem;">
    <v-data-table
      :headers="headers"
      :items="data"
      :search="search"
      :sort-by="[{ key: 'nama_produk', order: 'asc' }]"
    >
      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title>List Produk 
            <v-icon
              size="small"
              @click="refresh()"
            >
              mdi-refresh
            </v-icon>
          </v-toolbar-title>
          <v-select
            label="Status"
            style="display: inline-flex;"
            item-text="title"
            item-value="value"
            v-model="allData"
            :items="[{ title: 'Bisa Dijual', value: 'false' }, { title: 'Semua', value: 'true' }]"
            variant="outlined"
            density="compact"
            @update:modelValue="refresh()"
          ></v-select>
          <v-divider
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-text-field
            density="compact"
            variant="solo"
            label="Cari Produk"
            append-inner-icon="mdi-magnify"
            single-line
            hide-details
            v-model="search"
          ></v-text-field>
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                color="primary"
                dark
                class="mb-2"
                v-bind="props"
              >
                Tambah Produk
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        v-model="editedItem.nama_produk"
                        label="Nama Produk*"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                    >
                      <v-text-field
                        v-model="editedItem.harga"
                        label="Harga*"
                        type="number"
                        step="500"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                    >
                      <v-select
                        label="Status*"
                        item-text="title"
                        item-value="value"
                        v-model="editedItem.status_id"
                        :items="selects!.status || []"
                        variant="outlined"
                        required
                      ></v-select>
                    </v-col>
                    <v-col
                      cols="12"
                    >
                      <v-select
                        label="Kategori*"
                        item-text="title"
                        item-value="value"
                        v-model="editedItem.kategori_id"
                        :items="selects!.kategori || []"
                        variant="outlined"
                        required
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="close"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="save"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          size="small"
          class="me-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          size="small"
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:item.kategori_label="{ item }">
        <span>
          {{ selects!.kategoriKey[item.kategori_id] }}
        </span>
      </template>
      <template v-slot:item.status_label="{ item }">
        <span>
          {{ selects!.statusKey[item.status_id] }}
        </span>
      </template>
      <template v-slot:no-data>
        <h3>No Data Found</h3>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Dashboard - FastPrint"
})
const allData = ref('false')
const { data, refresh } = await useAsyncData('item', () => $fetch(`/api/produk?all=${allData.value}`))
const { data:selects } = await useAsyncData('selects', () => $fetch('/api/select'))
  const dialog = ref(false),
  dialogDelete = ref(false),
  headers = [
    readonly({
      title: 'ID Produk',
      align: 'start',
      sortable: false,
      key: 'id_produk',
    }),
    readonly({ title: 'Nama', key: 'nama_produk', width: '35%' }),
    readonly({ title: 'Harga', key: 'harga' }),
    readonly({ title: 'Kategori', key: 'kategori.nama_kategori' }),
    readonly({ title: 'Status', key: 'status_label' }),
    readonly({ title: 'Actions', key: 'actions', sortable: false }),
  ],
  editedIndex = ref(-1),
  editedItem = ref({
    id_produk: '',
    nama_produk: '',
    harga: 0,
    kategori_id: '',
    status_id: ''
  }),
  defaultItem = ref({
    id_produk: '',
    nama_produk: '',
    harga: 0,
    kategori_id: '',
    status_id: ''
  }),
  formTitle = computed(() => editedIndex.value === -1 ? 'Tambah Produk' : 'Edit Produk'),
  search = ref('');

function editItem (item: ItemTypes) {
  editedIndex.value = data.value!.indexOf(item)
  editedItem.value = Object.assign({}, item)
  dialog.value = true
}

function deleteItem (item: ItemTypes) {
  editedIndex.value = data.value!.indexOf(item)
  editedItem.value = Object.assign({}, item)
  dialogDelete.value = true
}

async function deleteItemConfirm () {
  await $fetch(`/api/produk/delete/${editedItem.value.id_produk}`)
  data.value!.splice(editedIndex.value, 1)
  closeDelete()
}

function close () {
  dialog.value = false
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value)
    editedIndex.value = -1
  })
}

function closeDelete () {
  dialogDelete.value = false
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value)
    editedIndex.value = -1
  })
}

async function save () {
  if (editedIndex.value > -1) {
    const response = await $fetch(`/api/produk/edit/${editedItem.value.id_produk}`, {
      method: 'POST',
      body: editedItem.value
    })
    Object.assign(data.value[editedIndex.value], response)
  } else {
    const response = await $fetch('/api/produk/create', {
      method: 'POST',
      body: editedItem.value
    })
    data.value?.push(response)
  }
  close()
}

interface ItemTypes {
    id_produk: number;
    nama_produk: string;
    harga: number;
    kategori_id: number;
    status_id: number;
}
</script>