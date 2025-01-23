<script setup lang="ts">

import { onMounted, ref } from 'vue'
import {
  getBomMaterialListByCode,
  getMaterialCodeList,
  getWarehouseCodeList,
  smkFeedCheck,
  smkFeedSave
} from '@/services/in-station.service'
import { message, Modal } from 'ant-design-vue'

const prop = defineProps({
  id: {
    type: Number,
    required: true,
  },
  opsetDetailId: {
    type: Number,
    required: true,
  },
  workstationMessage: {
    type: Object,
    required: false,
    default: {} as any
  },
  sheetMessage: {
    type: Object,
    required: false,
    default: {} as any
  }
});

// region 表格
// 表格数据
const tableData = ref<any[]>([])

// 提交状态
const submitLoading = ref(false);
/**
 * 提交
 */
function submit() {
  const params = {
    equipCode: prop.workstationMessage?.workstationCode,
    feedUser: localStorage.username,
    workSheetCode: prop.sheetMessage?.workSheetCode,
    feedDetailVMs: [] as any
  }
  tableData.value.forEach((item: any) => {
    item.details?.forEach((detail: any) => {
      params.feedDetailVMs.push({
        ...detail,
        materialCode: item.materialCode
      });
    });
  });
  if (params.feedDetailVMs.length === 0) {
    message.error('请先添加物料');
    return;
  }
  submitLoading.value = true;
  smkFeedSave(params).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      message.success('操作成功')
      delOptions(false);
    } else {
      message.error(`操作失败, ${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    submitLoading.value = false;
  });
}
// endregion

// region 投料

// 投料抽屉
const feedView = ref(false);
const formRef = ref();
const editItem = ref<any>({});
const formState = ref<any>([]);
const isCreate = ref(false);

function showFeed(row?: any) {
  feedView.value = true;
  editItem.value = row || {};
  formState.value = row?.details || [];
}

/**
 * 关闭抽屉
 */
function close() {
  editItem.value = {};
  feedView.value = false;
  isCreate.value = false;
  formState.value = [];
}

/**
 * 添加一行
 */
function addFeedLine() {
  formState.value.push({
    unFeedNumber: 0
  });
}

/**
 * 删除一行
 * @param index
 * @param i
 */
function delFeedLine(index: number, i?: number) {
  Modal.confirm({
    title: '确定删除吗？',
    onOk() {
      formState.value.splice(index, 1);
    },
  });
}

/**
 * 获取干料总量
 */
function getDryChargeSum(row?: any, type?: number) {
  let sum = 0;
  const list = row ? row.details : formState.value;
  list?.forEach((item: any) => {
    if (type) {
      sum += item.feedNumber;
    } else if (item.feedNumber >= 0 && item.waterNumber >= 0) {
      sum += item.feedNumber * (1 - item.waterNumber)
    }
  });
  return sum.toFixed(2);
}
/**
 * 获取盘盈总量
 */
function getUnFeedNumberSum(row: any) {
  let sum = 0;
  row.details?.forEach((item: any) => {
    if (item.unFeedNumber >= 0 ) {
      sum += item.unFeedNumber * 1;
    }
  });
  return sum.toFixed(2);
}
/**
 * 获取干料量
 * @param item
 */
function getDryCharge(item: any) {
  if (item.feedNumber >= 0 && item.waterNumber >= 0) {
    return (item.feedNumber * (1 - item.waterNumber)).toFixed(2);
  }
  return 0;
}

const checkLoading = ref(false);
/**
 * 投料验证
 */
function feedingCheck() {
  formRef.value.validate()
    .then(() => {
      const params: any = [];
      formState.value.forEach((item: any) => {
        if (
          prop.workstationMessage?.workstationName.includes('制粉') ||
          prop.workstationMessage?.workstationName.includes('施釉') ||
          prop.workstationMessage?.workstationName.includes('打包')
        ) {
          params.push({
            ...item,
            waterNumber: 0,
            equipCode: prop.workstationMessage?.workstationCode,
            feddUser: localStorage.username,
            workSheetCode: prop.sheetMessage?.workSheetCode,
            bindingId: prop.id,
            materialCode: editItem.value.materialCode,
          });
        } else if (item.feedNumber >= 0 && item.waterNumber >= 0) {
          params.push({
            ...item,
            equipCode: prop.workstationMessage?.workstationCode,
            feddUser: localStorage.username,
            workSheetCode: prop.sheetMessage?.workSheetCode,
            bindingId: prop.id,
            materialCode: editItem.value.materialCode,
          });
        }
      });

      if( !isCreate.value ) {
        checkLoading.value = true;
        smkFeedCheck(params).then(({ data: {code, data, msg} }: any) => {
          if (code == 200) {
            message.success('操作成功')
            const values = formState.value;
            values.forEach((item: any) => {
              if (!item.waterNumber) {
                item.waterNumber = 0;
              }
              item.materialCode = editItem.value.materialCode;
              item.warehouseCode = item.warehouseCode || '';
            });
            editItem.value.details = values;
            close();
          } else {
            message.error(`操作失败, ${msg}`)
          }
        }).catch((err) => {
          message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
        }).finally(() => {
          checkLoading.value = false;
        });
      } else {
        editItem.value.details = formState.value;
        tableData.value.unshift(editItem.value);
        close();
      }
   });
}

/**
 * 保存操作
 */
function saveOptions() {
  localStorage.setItem(`feed_${prop.sheetMessage?.workSheetCode}`, JSON.stringify(tableData.value));
  message.success('保存成功');
}
/**
 * 删除操作
 */
function delOptions(showMessage: boolean = true) {
  localStorage.removeItem(`feed_${prop.sheetMessage?.workSheetCode}`);
  if (showMessage) {
    message.success('操作成功');
  }
}
// endregion


//region 查询物料列表

const materialCodeList = ref<any>([]);
const materialCodeListLoading = ref<any>(false);

/**
 * 搜索物料
 * @param val
 */
function searchMaterial(val: string) {
  materialCodeListLoading.value = true;
  getMaterialCodeList(val).then(({ data: {code, data: { results }, msg} }: any) => {
    if (code == 200) {
      materialCodeList.value = [];
      results.forEach((item: any) => {
        materialCodeList.value.push({
          label: item.materialName,
          value: item.materialCode
        })
      })
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    materialCodeListLoading.value = false;
  });
}

// endregion

// region 库位查询
const warehouseCodeList = ref<any>([]);
function getWarehouseCodeLists(val: string) {
  getWarehouseCodeList({
    workstationCode: prop.workstationMessage?.workstationCode,
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
    areaCode: val
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      warehouseCodeList.value = [];
      data.forEach((item: any) => {
        warehouseCodeList.value.push({
          label: item.equipName,
          value: item.equipCode
        })
      })
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    });
  });
}

// endregion


// region 初始化

// 物料列表
const loading = ref(false);
/**
 * 显示投料抽屉
 */
function init() {
  const data = localStorage.getItem(`feed_${prop.sheetMessage?.workSheetCode}`);
  if (data) {
    tableData.value = JSON.parse(data);
  } else {
    loading.value = true;
    getBomMaterialListByCode(prop.workstationMessage?.workstationCode).then(({ data: {code, data, msg} }: any) => {
      if (code == 200) {
        const arr: any[] = [];
        data.forEach((item: any) =>{
          item.notEdit = true;
          arr.push({
            ...item,
            notEdit: true,
          })
        })
        tableData.value = arr;
      } else {
        message.error(`操作失败请联系管理员${msg}`)
      }
    }).catch((err) => {
      message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
    }).finally(() => {
      loading.value = false;
    });
  }
}
onMounted(() => {
  init();
  getWarehouseCodeLists('');
});

// endregion


</script>

<template>
  <div style="max-width: calc(100vw - 270px);">
    <a-space direction="vertical" style="width: 100%">
      <a-space>
        <a-button type="primary" @click="isCreate = true; showFeed()">
          新增
        </a-button>
        <a-button type="primary" @click="submit()" :loading="submitLoading">
          投料
        </a-button>
        <a-button type="dashed" @click="saveOptions()" >
          保存当前操作
        </a-button>
      </a-space>

      <vxe-table
        border
        :loading="loading"
        :height="400"
        :data="tableData"
      >
        <vxe-column type="seq" width="70"></vxe-column>
        <vxe-column field="materialCode" title="物料编号" min-width="120"></vxe-column>
        <vxe-column field="materialName" title="原料名称" min-width="200"></vxe-column>
        <vxe-column field="materialDosage" title="干料标准量" min-width="180"></vxe-column>
        <vxe-column field="unit" title="单位" min-width="180"></vxe-column>
        <vxe-column field="materialUseNumber" title="已投入量" min-width="180"></vxe-column>
        <vxe-column title="加料量" min-width="180" v-if="workstationMessage?.workstationName.includes('制粉')">
          <template #default="{ row }">
            {{getDryChargeSum(row, 1)}}
          </template>
        </vxe-column>
        <vxe-column title="干料投入量" min-width="180" v-else-if="!workstationMessage?.workstationName.includes('施釉')">
          <template #default="{ row }">
            {{getDryChargeSum(row)}}
          </template>
        </vxe-column>
        <vxe-column title="盘盈数量" min-width="180">
          <template #default="{ row }">
            {{getUnFeedNumberSum(row)}}
          </template>
        </vxe-column>
        <vxe-column title="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <a-button type="primary" @click="showFeed(row)">
              加料
            </a-button>
          </template>
        </vxe-column>
      </vxe-table>
    </a-space>

    <a-drawer
      v-model:open="feedView"
      :footer-style="{ textAlign: 'right' }"
      title="加料"
      :width="600"
      placement="right"
      @close="close"
    >
      <a-form
        ref="formRef"
        layout="inline"
        :model="formState"
      >
        <a-row>
          <a-col :span="8">
            <a-form-item label="物料编号">
              <a-select
                v-model:value="editItem.materialCode"
                show-search
                placeholder="输入编号进行查询"
                style="width: 160px;"
                :filter-option="false"
                :options="materialCodeList"
                @search="searchMaterial"
                @change="(_val: any, _item: any) => {
                  editItem.materialName = _item.label;
                }"
                v-if="isCreate"
              >
                <template v-if="materialCodeListLoading" #notFoundContent>
                  <a-spin size="small" />
                </template>
              </a-select>
              <span style="width: 160px;display: inline-block;" v-else>{{editItem.materialCode}}</span>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="物料名称">
              <span style="width: 160px;display: inline-block;">{{editItem.materialName}}</span>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="!(workstationMessage?.workstationName.includes('施釉') || workstationMessage?.workstationName.includes('打包') || workstationMessage?.workstationName.includes('制粉')) ? '标准干料量' : '标准投入量'">
              <a-input v-model:value="editItem.materialDosage" placeholder="物料名称" v-if="isCreate"></a-input>
              <span style="width: 160px;display: inline-block;" v-else>{{editItem.materialDosage}}</span>
            </a-form-item>
          </a-col>
          <a-col :span="8" v-if="
          !(workstationMessage?.workstationName.includes('施釉') || workstationMessage?.workstationName.includes('打包') || workstationMessage?.workstationName.includes('制粉'))">
            <a-form-item label="当前投入干料量">
              <span  style="width: 160px;display: inline-block;">
                {{getDryChargeSum()}}
              </span>
            </a-form-item>
          </a-col>
          <a-col :span="8" v-if="
          !(workstationMessage?.workstationName.includes('施釉') || workstationMessage?.workstationName.includes('打包') || workstationMessage?.workstationName.includes('制粉'))">
            <a-form-item label="当前投入干料量">
              <span  style="width: 160px;display: inline-block;">
                {{getDryChargeSum()}}
              </span>
            </a-form-item>
          </a-col>
          <a-col :span="8" >
            <a-form-item label="当前投入干料量">
              <span  style="width: 160px;display: inline-block;">
                {{editItem.materialUseNumber}}
              </span>
            </a-form-item>
          </a-col>
        </a-row>
        <template v-for="(item, index) of formState" :key="index">
          <a-space direction="vertical" style="border:1px solid red; margin: 1em 0;padding: 0.5em;">
            <a-row  v-if="
              !(workstationMessage?.workstationName.includes('施釉') ||
              workstationMessage?.workstationName.includes('打包') ||
              workstationMessage?.workstationName.includes('制粉'))">
              <a-col :span="8">
                <a-form-item
                  label="物料批次"
                  :name="[index, 'batchCode']"
                  :rules="[{ required: true, message: '该项为必填项!' }]"
                >
                  <a-input v-model:value="item.batchCode" placeholder="物料批次" v-if="isCreate"></a-input>

                  <a-select
                    v-model:value="item.batchCode"
                    show-search
                    placeholder="请选择"
                    style="width: 160px"
                    :options="editItem.batchCodes"
                    :field-names="{ label: 'batchCode', value: 'batchCode' }"
                    @change="(_v: any, _i: any) => {
                      item.waterNumber = _i.waterNumber;
                      item.areaCode = _i.areaCode;
                      item.warehouseCode = _i.warehouseCode;
                    }"
                    v-else
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  label="含水率"
                >
                  <a-input v-model:value="item.waterNumber" placeholder="含水率" v-if="isCreate"></a-input>
                  <span style="display: inline-block;width: 160px;" v-else-if="item.waterNumber">
                    {{(item.waterNumber * 100).toFixed(2) }}%
                  </span>
                  <span style="display: inline-block;width: 160px;" v-else>
                    0
                  </span>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  label="SAP储位"
                >
                  <a-input v-model:value="item.areaCode" placeholder="SAP储位" v-if="isCreate"></a-input>
                  <span style="display: inline-block;width: 160px;" v-else>
                    {{ item.areaCode }}
                  </span>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  label="SAP库位"
                >
                  <a-input v-model:value="item.warehouseCode" placeholder="SAP库位" v-if="isCreate"></a-input>
                  <span style="display: inline-block;width: 160px;" v-else>
                    {{ item.warehouseCode }}
                  </span>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  label="实际库位"
                  v-if=" workstationMessage?.workstationName.includes('制浆')"
                >
                  <a-input v-model:value="item.sjWarehouseCode" placeholder="实际库位" v-if="isCreate"></a-input>
                  <span style="display: inline-block;width: 160px;" v-else>
                    {{ item.sjWarehouseCode }}
                  </span>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-if="workstationMessage?.workstationName.includes('施釉') || workstationMessage?.workstationName.includes('制粉')">
              <a-col :span="24">
                <a-form-item
                  label="库位"
                  :name="[index, 'warehouseCode']"
                  :rules="[{ required: true, message: '该项为必填项!' }]"
                >
                  <a-select
                    v-model:value="item.warehouseCode"
                    show-search
                    placeholder="请选择"
                    style="width: 500px;"
                    :options="warehouseCodeList"
                    @search="getWarehouseCodeLists"
                  ></a-select>
                  <!--
                @change="(value: any) => {
                      if (value.length > 1) {
                        item.warehouseCode = value.slice(0, 1);
                      } else {
                        item.warehouseCode = value;
                      }
                    }"-->
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="8">
                <a-form-item
                  label="实际投入量"
                  :name="[index, 'feedNumber']"
                  :rules="[{ required: true, message: '该项为必填项!' }]"
                >
                  <a-input-number
                    style="width: 160px;"
                    v-model:value="item.feedNumber"
                    placeholder="实际投入量"
                    :addon-after="editItem.unit"
                    :min="0"
                  ></a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="8" v-if="
              !(workstationMessage?.workstationName.includes('施釉') || workstationMessage?.workstationName.includes('打包') || workstationMessage?.workstationName.includes('制粉'))">
                <a-form-item
                  label="实际干料量"
                >
                  <span style="display: inline-block;width: 160px;">
                    {{ getDryCharge(item) }}
                  </span>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  label="盘盈数量"
                  :name="[index, 'unFeedNumber']"
                  :rules="[{ required: true, message: '该项为必填项!' }]"
                >
                  <a-input-number :min="0" style="width: 160px;" v-model:value="item.unFeedNumber" placeholder="盘盈数量"></a-input-number>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :offset="16" :span="8">
                <a-button type="primary" style="width:100%;" danger @click="delFeedLine(index)">删除</a-button>
              </a-col>
            </a-row>
          </a-space>
        </template>
      </a-form>
      <a-button type="primary" @click="addFeedLine()" style="width:100%">添加</a-button>

      <template #footer>
        <a-button style="margin-right: 8px" @click="close">取消</a-button>
        <a-button type="primary" @click="feedingCheck" :loading="checkLoading">提交</a-button>
      </template>
    </a-drawer>

  </div>
</template>

<style scoped lang="scss">

</style>
