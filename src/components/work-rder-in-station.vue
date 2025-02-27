<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  getAllWorkstationList,
  getWorksheetByCode,
  getWorksheetListByWorkstationCode,
  inputSmkWorksheet
} from '@/services/workstation.service'
import { getHomepage } from '@/services/machine-summary.service'


const router = useRouter();


// region 工作站信息及选择
// 工作站列表
const workList = ref<any>([]);
const workListLoading = ref<any>(false);
// 选中的工作站编号
const workstationCode = ref<any>('');
// 选中的工作站
const workstation = ref<any>('');
/**
 * 查询工作站
 */
function queryWork () {
  workListLoading.value = true;
  getAllWorkstationList().then(({ data: { code, data, msg } }) => {
    if (code == 200) {
      data.forEach((item: any) => {
        workList.value.push({
          label: `${item.workstationName}-${item.stationTypeName}`,
          value: item.workstationCode
        })
      })
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,

      })
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    workListLoading.value = false;
  })
}

/**
 * 选择工作站
 */
function selectedWork() {
  workstation.value = workstationCode.value;
  productListLoading.value = true;
  getWorksheetListByWorkstationCode(workstation.value).then(({ data: {code, data, msg} }) => {
    if (code == 200) {
      data.forEach((item: any) => {
        productList.value.push({
          label: `${item.workSheetCode}-${item.productCode}-${item.productName}`,
          value: item.workSheetCode
        })
      })
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,

      })
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    productListLoading.value = false;
  })
}

/**
 * 查询机台汇总信息
 */
function inquiryTable() {
  productListLoading.value = true;
  getHomepage(workstationCode.value).then(({ data }) => {
    if (data.code == 200) {
      const {
        data: {
          sheetStatusDTOs,
        }
      } = data
      if (sheetStatusDTOs && sheetStatusDTOs[0]) {
        selectedProductCode.value = sheetStatusDTOs[0].workSheetCode;
        workstation.value = workstationCode.value;
        // 选中的工单
        localStorage.lockProductCode = selectedProductCode.value;
        // 选中的工作站
        localStorage.equipmentCode = workstation.value;

        workList.value.forEach((item: any) => {
          if (item.value == workstationCode.value) {
            localStorage.equipmentName = item.label;
          }
        })
        isNotEdit.value = true;
        router.push(`/feed?workstation=${workstation.value}`);
        setTimeout(() => {
          location.reload();
        }, 200)
      } else {
        selectedWork();
      }
    } else {
      message.error({
      content: `操作失败请联系管理员${data.msg}`,

    })
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,
    })
  }).finally(() => {
    productListLoading.value = false;
  })
}

// endregion

// region 工单信息及选择
// 产品信息列表
const productList = ref<any>([]);
// 产品信息列表加载状态
const productListLoading = ref<any>(false);
// 当前选中的工单编号
const selectedProductCode = ref<any>();
// 选中的产品
const selectedProduct = ref<any>({});
// 是否不能编辑
const isNotEdit = ref(false);
const loading = ref(false);
/**
 * 根据工作订单号更新选中的产品信息
 */
function changeProduct() {
  // 首先清空已选中的产品信息
  selectedProduct.value = {};
  loading.value = true;

  // 如果没有选中的工作订单号，则直接返回
  if (!selectedProductCode.value) return;

  getWorksheetByCode(selectedProductCode.value).then(({ data: { code, data, msg } }) => {
    if (code == 200) {
      selectedProduct.value = data;
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,

      })
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    loading.value = false;
  })
}

const pullInLoading = ref(false);
/**
 * 进站
 */
function pullIn() {
  pullInLoading.value = true;
  inputSmkWorksheet({
    worksheetCode: selectedProductCode.value,
    equipmentCode: workstation.value,
    createUser: localStorage.username,
  }).then(({ data: { code, msg } }) => {
    if (code == 200) {
      message.success('工单进站成功!');
      // 选中的工单
      localStorage.lockProductCode = selectedProductCode.value;
      // 选中的工作站
      localStorage.equipmentCode = workstation.value;
      workList.value.forEach((item: any) => {
        if (item.value == workstationCode.value) {
          localStorage.equipmentName = item.label;
        }
      })
      localStorage.lockProductValue = JSON.stringify(selectedProduct.value);
      isNotEdit.value = true;
      router.push(`/feed?workstation=${workstation.value}`);
      setTimeout(() => {
        location.reload();
      }, 500)
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,

      })
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    pullInLoading.value = false;
  })
}

// endregion

onMounted(() => {
  if (localStorage.lockProductCode &&  localStorage.equipmentCode) {
    selectedProductCode.value = localStorage.lockProductCode;
    workstation.value = localStorage.equipmentCode;
    router.push(`/feed`);
    isNotEdit.value = true;
  }
  if (localStorage.lockProductValue) {
    selectedProduct.value = JSON.parse(localStorage.lockProductValue);
  }
  queryWork();
})
</script>

<template>
  <div class="main-container" >

    <a-space direction="vertical">
      <!-- 工单信息及选择 -->
      <a-card :bordered="false" class="main-card">
        <a-spin :spinning="loading" >
          <a-descriptions :column="2" bordered>
            <a-descriptions-item v-if="!workstation" label="工作站" :span="2">
              <a-space>
                <a-select
                  v-model:value="workstationCode"
                  show-search
                  placeholder=""
                  style="width: 400px"
                  :filter-option=" (input: string, option: any) => {
                      return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                    }"
                  :options="workList"
                >
                  <template v-if="workListLoading" #notFoundContent>
                    <a-spin size="small" />
                  </template>
                </a-select>
<!--                <a-button type="primary" @click="selectedWork" :disabled="!workstationCode">确认选择</a-button>-->
                <a-button type="primary" @click="inquiryTable" :disabled="!workstationCode" :loading="productListLoading">确认选择</a-button>
              </a-space>
            </a-descriptions-item>
            <template v-else>
              <a-descriptions-item label="工单号" :span="2">
                <a-space>
                  <a-select
                    v-model:value="selectedProductCode"
                    show-search
                    placeholder=""
                    style="width: 400px"
                    :options="productList"
                    :disabled="isNotEdit"
                    :loading="productListLoading"
                    @select="changeProduct"
                  >
                    <template v-if="productListLoading" #notFoundContent>
                      <a-spin size="small" />
                    </template>
                  </a-select>
                  <a-button
                    type="primary"
                    @click="pullIn"
                    :disabled="!selectedProductCode || isNotEdit"
                    :loading="pullInLoading"
                  >进站</a-button>
                </a-space>
              </a-descriptions-item>
              <a-descriptions-item label="工单号"  :span="2">{{ selectedProduct.workSheetCode }}</a-descriptions-item>
              <a-descriptions-item label="产品编号"  >{{ selectedProduct.productCode }}</a-descriptions-item>
              <a-descriptions-item label="产品名称"  >{{ selectedProduct.productName }}</a-descriptions-item>
              <a-descriptions-item label="计划数量"  >{{ selectedProduct.workSheetPlanNumber }}</a-descriptions-item>
              <a-descriptions-item label="未完成数量"  >{{ (selectedProduct.workSheetPlanNumber - (selectedProduct.workSheetFinishNumber ? selectedProduct.workSheetFinishNumber: 0) || '') }}</a-descriptions-item>
            </template>
          </a-descriptions>
        </a-spin>
      </a-card>
    </a-space>
  </div>
</template>

<style scoped lang="scss">
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 3em;
  flex-direction: column;
  height: calc(100vh - 70px);
}
</style>
