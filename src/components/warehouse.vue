<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAllLCWarehouseList, getWarehouseListByStationCode } from '@/services/in-station.service'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'

// region 库存获取
const inventory = ref<any[]>([]);
const inventoryLoading = ref(false);
const queryParams = ref({
  areaCode: '',
});

function queryWarehouseList() {
  inventoryLoading.value = true;
  getAllLCWarehouseList(queryParams.value.areaCode).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      console.log(data);
      inventory.value = data;
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,
    })
  }).finally(() => {
    inventoryLoading.value = false;
  });
}

// endregion

onMounted(() => {
  queryWarehouseList();
})
</script>

<template>
  <div class="container">
    <!--region 查询条件 -->
    <a-form layout="inline">
      <a-form-item label="库位号" name="price">
        <a-input
          v-model:value="queryParams.areaCode"
          placeholder="请输入库位号"
        />
      </a-form-item>
      <a-form-item label="" name="">
        <a-button type="primary" @click="queryWarehouseList()">
          <template #icon>
            <SearchOutlined />
          </template>
          查询
        </a-button>
      </a-form-item>
    </a-form>
    <!-- endregion -->

    <vxe-table
      :data="inventory"
      :loading="inventoryLoading"
      height="500px"
      :style="{
      'max-width': `calc(100vw - 250px)`,
      margin: '1em 0'
    }"
    >
      <vxe-column type="seq" width="60"></vxe-column>
      <vxe-column field="materialCode" min-width="160" title="料号"></vxe-column>
      <vxe-column field="materialName" min-width="120" title="物料名称"></vxe-column>
      <!--    <vxe-column field="batchCode" min-width="160" title="批次号"></vxe-column>-->
      <vxe-column field="warehouseCode" min-width="160" title="库位号"></vxe-column>
      <!--    <vxe-column field="areaCode" min-width="160" title="储位号"></vxe-column>-->
      <vxe-column field="stockQuality" min-width="160" title="库存量"></vxe-column>
      <vxe-column field="unit" min-width="160" title="单位"></vxe-column>
    </vxe-table>
  </div>
</template>

<style scoped lang="scss">

.container {
  padding: 1em 5%;
  max-height: 100vh;
  overflow: auto;
}
</style>