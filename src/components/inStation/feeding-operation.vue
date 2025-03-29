<script setup lang="ts">

import { h, onMounted, ref } from 'vue'
import {
  getAuditByRecord,
  getBomMaterialListByCode, getMaterialCodeByJjcl,
  getMaterialCodeList, getWarehouseByMaterialCode,
  getWarehouseCodeList, getZFBomMaterialListByCode, pushAuditRecord,
  smkFeedCheck, smkFeedDBSave, smkFeedFXSave,
  smkFeedSave, smkFeedSYSave, smkFeedZFSave,
  smkFeedZs, smkFeedZSSave, smkFeedZYSave
} from '@/services/in-station.service'
import { Input, message, Modal } from 'ant-design-vue'

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
  },
  zsStatus: {
    type: Boolean,
    required: false,
    default: false
  }
});

// region 表格
// 表格数据
const tableData = ref<any[]>([])

// 提交状态
const submitLoading = ref(false);
// 杂收提交状态
const miscellaneousIncomeLoading = ref(false);
// 是否尚未杂收
const miscellaneousIncome = ref(true);
/**
 * 提交
 */
function submit(type: 0 | 1) {
  const params = {
    equipCode: prop.workstationMessage?.workstationCode,
    feedUser: localStorage.username,
    workSheetCode: prop.sheetMessage?.workSheetCode,
    feedDetailVMs: [] as any
  }
  tableData.value.forEach((item: any) => {
    item.details?.forEach((detail: any) => {
      if (detail.feedNumber >= 0) {
        params.feedDetailVMs.push({
          ...detail,
          materialCode: item.materialCode
        });
      }
    });
  });
  if (params.feedDetailVMs.length === 0) {
    message.error('请先添加物料');
    return;
  }
  let ob: any;
  if (type === 1) {
    if (prop.workstationMessage?.workstationName.includes('制浆')) {
      ob =  smkFeedSave(params);
    }
    else if (prop.workstationMessage?.workstationName.includes('制粉')) {
      ob =  smkFeedZFSave(params);
    }
    else if (prop.workstationMessage?.workstationName.includes('制色')) {
      ob =  smkFeedZSSave(params);
    }
    else if (prop.workstationMessage?.workstationName.includes('制釉') || prop.workstationMessage?.workstationName.includes('效果釉')) {
      ob =  smkFeedZYSave(params);
    }
    else if (prop.workstationMessage?.workstationName.includes('施釉')) {
      ob =  smkFeedSYSave(params);
    }
    else if (prop.workstationMessage?.workstationName.includes('打包')) {
      ob =  smkFeedDBSave(params);
    }
    else if (prop.workstationMessage?.workstationName.includes('复选')) {
      ob =  smkFeedFXSave(params);
    }
    else {
      message.warning('当前没有具体的接口, 请联系相关人员!')
      return;
    }
    submitLoading.value = true;
  } else {
    ob = smkFeedZs(params);
    miscellaneousIncomeLoading.value = true;
  }
  ob.then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      message.success('操作成功')
      if (type === 1) {
        // miscellaneousIncome.value = true;
        localStorage.removeItem(`feed_${prop.sheetMessage?.workSheetCode}`);
        getWarehouseCodeLists('');
        init();
      } else {
        miscellaneousIncome.value = false;
        saveOptions();
      }
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,
      })
    }
  }).catch((err: any) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    submitLoading.value = false;
    miscellaneousIncomeLoading.value = false;
  });
}

/**
 * 删除一行
 * @param rowIndex
 */
function delRow(rowIndex: number) {
  Modal.confirm({
    title: '确定删除吗？',
    onOk() {
      tableData.value.splice(rowIndex, 1);
    },
  });
}
// endregion

// region 投料

// 投料抽屉
const feedView = ref(false);
const formRef = ref();
const editItem = ref<any>({});
const formState = ref<any>([]);
// 物料列表
const materialCodeList = ref<any>([]);

/**
 * 新增
 */
function create() {
  showFeed({
    created: true,
    materialUseNumber: 0
  });
  getMaterialCodeByJjcl().then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      if (data && data.length > 0) {
        materialCodeList.value = [];
        data.forEach((item: any) => {
          materialCodeList.value.push({
            label: item.materialName,
            value: item.materialCode,
            unit: item.unit,
          });
        });
      }
    }
  })
}

/**
 * 查询库位(制粉)
 */
function queryLibraryLocation() {
  if (editItem.value.materialCode) {
    getWarehouseByMaterialCode(editItem.value.materialCode).then(({ data: {code, data, msg} }: any) => {
      if (code == 200) {
        console.log(data);
        if (data && data.length > 0) {
          data.forEach((item: any) => {
            warehouseCodeList.value.push({
              label: `${item.warehouseCode}(${item.stockQuality})__${item.remake ?? ''}`,
              value: `${item.warehouseCode}&&${item.stockQuality}&&${item.areaCode ?? ''}&&${item.batchCode ?? ''}`
            })
          })
        }
      }
    })
  }
}

/**
 * 显示投料抽屉
 * @param row
 */
function showFeed(row?: any) {
  feedView.value = true;
  editItem.value = row || {};

  // 判断是否处于审核状态
  if (editItem.value.overtakingApproval) {
    formState.value = editItem.value.overclaimDetails;
  } else {
    formState.value = editItem.value?.details || [];
  }
  if (formState.value.length === 0) {
    if (
      prop.workstationMessage?.workstationName.includes('施釉') ||
      prop.workstationMessage?.workstationName.includes('制粉') ||
      prop.workstationMessage?.workstationName.includes('效果釉') ||
      prop.workstationMessage?.workstationName.includes('制釉')
    ) {
      formState.value.push({
        unFeedNumber: 0
      });
      warehouseCodeList.value = [];
      editItem.value.batchCodes?.forEach((item: any) => {
        warehouseCodeList.value.push({
          label: `${item.warehouseCode}(${item.stockQuality})__${item.remake ?? ''}`,
          value: `${item.warehouseCode}&&${item.stockQuality}&&${item.areaCode ?? ''}&&${item.batchCode ?? ''}`
        })
      });
    } else {
      if (editItem.value.batchCodes) {
        editItem.value.batchCodes.forEach((item: any) => {
          formState.value.push({
            waterNumber: item.waterNumber,
            areaCode: item.areaCode,
            warehouseCode: item.warehouseCode,
            batchCode: item.batchCode,
            standardNumber: item.standardNumber,
            stockQuality: item.stockQuality,
            unFeedNumber: 0
          });

          warehouseCodeList.value.push({
            label: item.warehouseCode,
            value: `${item.warehouseCode}&&${item.stockQuality}`
          })
        });
      } else {
        formState.value.push({
          unFeedNumber: 0
        });
      }
    }
  }
}

/**
 * 关闭抽屉
 */
function close() {
  editItem.value = {};
  feedView.value = false;
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
 * 获取湿料总量
 */
function obtainTheAmountOfWetMaterialInput(row?: any) {
  let sum = 0;
  const list = row ? row.details : formState.value;
  list?.forEach((item: any) => {
    if (item.feedNumber>= 0) {
      sum += item.feedNumber;
    }
  });
  return sum.toFixed(6) ?? 0;
}
/**
 * 获取干料总量
 */
function getDryChargeSum(row?: any) {
  return (type?: number) => {
    let sum = 0;
    const list = row ? row.details : formState.value;
    list?.forEach((item: any) => {
      if (type && item.feedNumber>= 0) {
        sum += item.feedNumber;
      } else if (item.feedNumber >= 0 && item.waterNumber >= 0) {
        sum += item.feedNumber * (1 - item.waterNumber)
      }
    });
    return sum.toFixed(6) ?? 0;
  }
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
  return sum.toFixed(6);
}
/**
 * 获取干料量
 * @param item
 */
function getDryCharge(item: any) {
  if (item.feedNumber >= 0 && item.waterNumber >= 0) {
    return (item.feedNumber * (1 - item.waterNumber)).toFixed(6);
  }
  return 0;
}

const checkLoading = ref(false);
const remark = ref('');

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
          prop.workstationMessage?.workstationName.includes('制釉') ||
          prop.workstationMessage?.workstationName.includes('效果釉') ||
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
            warehouseCode: (typeof item.warehouseCode === 'string') ? item.warehouseCode : item.warehouseCode[0]
          });
        } else if (item.feedNumber >= 0 && item.waterNumber >= 0) {
          params.push({
            ...item,
            equipCode: prop.workstationMessage?.workstationCode,
            feddUser: localStorage.username,
            workSheetCode: prop.sheetMessage?.workSheetCode,
            bindingId: prop.id,
            materialCode: editItem.value.materialCode,
            warehouseCode: (typeof item.warehouseCode === 'string') ? item.warehouseCode : item.warehouseCode[0]
          });
        }
      });

      if( !editItem.value.created ) {
        checkLoading.value = true;
        smkFeedCheck(params).then(({ data: {code, data, msg} }: any) => {
          if (code == 200) {
            message.success('操作成功');
            if (prop.workstationMessage?.workstationName.includes('制浆')) {
              data.forEach((_item: any, index: number) => {
                formState.value[index].unFeedNumber = _item.unFeedNumber
                formState.value[index].feedMumber = _item.feedMumber
              })
            }
            editItem.value.details = getRawMaterialData();
            close();
          } else if (code === 402) {
            if (prop.workstationMessage?.workstationName.includes('制浆')) {
              data.forEach((_item: any, index: number) => {
                formState.value[index].unFeedNumber = _item.unFeedNumber
                formState.value[index].feedMumber = _item.feedMumber
              })
            }
            Modal.confirm({
              title: '是否提交超领审批？',
              content: h(
                Input,
                {
                  onChange: (val: any) => {
                    remark.value = val.target.value;
                  }
                }
              ),
              onOk() {
                params.forEach((item: any) => {
                  item.remark = remark.value;
                })
                submitOverclaim(params);
              },
            });
          } else {
            message.error({
              content: `操作失败请联系管理员${msg}`,
            });
          }
        }).catch((err) => {
          message.error({
            content: `操作失败请联系管理员,${err.message ? err.message : err}`,
          });
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
 * 获取加料数据
 */
function getRawMaterialData() {
  const values = formState.value;
  values.forEach((item: any) => {
    if (!item.waterNumber) {
      item.waterNumber = 0;
    }
    item.materialCode = editItem.value.materialCode;
    item.warehouseCode = (typeof item.warehouseCode === 'string') ? item.warehouseCode : item.warehouseCode[0];
    item.warehouseCode = item.warehouseCode || '';
  });
  return values;
}

/**
 * 提交超领审批
 */
function submitOverclaim(params: any) {

  pushAuditRecord(params).then(({ data: {code, msg} }: any) => {
    if (code == 200) {
      // 设置超领详情, 备份不干扰源数据
      editItem.value.overclaimDetails = getRawMaterialData();
      queryAuditByRecord();
      close();
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,
      });
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,
    });
  })
}
// 是否处于审核状态
const overclaimStatus = ref(false);
const queryTimeoutId = ref();
// 查询是否处于审核状态
function queryAuditByRecord() {
  getAuditByRecord({
    workstationCode: prop.workstationMessage?.workstationCode,
    worksheetCode: prop.sheetMessage?.workSheetCode,
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      // 设置超领详情, 备份不干扰源数据
      overclaimStatus.value = data === -1;
      if (!overclaimStatus.value) {
        tableData.value.forEach((item: any) => {
          if (data === 1 && item.overclaimDetails) {
            item.details = item.overclaimDetails;
          } else {
            item.overclaimDetails = undefined;
          }
        })
      }
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,
      });
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,
    });
  }).finally(() => {
    clearTimeout(queryTimeoutId.value);
    if (overclaimStatus.value) {
      queryTimeoutId.value = setTimeout(() => {
        queryAuditByRecord();
      }, 1000 * 20);
    }
  })
}

/**
 * 保存操作
 */
function saveOptions() {
  localStorage.setItem(`feed_${prop.sheetMessage?.workSheetCode}`, JSON.stringify(tableData.value));
  message.success('保存成功');
}
/**
 * 清除已保存的数据
 */
function clearOptions() {
  Modal.confirm({
    title: '确定清除已保存的内容吗？',
    onOk() {
      localStorage.removeItem(`feed_${prop.sheetMessage?.workSheetCode}`);
      message.success('清除成功');
      setTimeout(() => {
        location.reload();
      }, 500);
    },
  });
}
// endregion

// region 库位查询
const warehouseCodeList = ref<any>([]);

/**
 * 查询库位信息
 * @param val
 */
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
          value: `${item.equipCode}&&${item.stockQuality}`
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
    let ob: any;
    if (prop.workstationMessage?.workstationName.includes('制粉') ) {
      ob = getZFBomMaterialListByCode(prop.workstationMessage?.workstationCode, prop.sheetMessage?.workSheetCode)
    } else {
      ob = getBomMaterialListByCode(prop.workstationMessage?.workstationCode, prop.sheetMessage?.workSheetCode)
    }
    ob.then(({ data: {code, data, msg} }: any) => {
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
    }).catch((err: any) => {
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
  queryAuditByRecord();

  // 添加事件监听器
  window.addEventListener('beforeunload', function(event) {
    // 返回的字符串将作为确认对话框的提示信息
    // 注意：在某些浏览器中，自定义的提示信息可能会被忽略，显示浏览器默认的提示信息
    event.returnValue = '您正在离开当前页面，确定要继续吗？';
    // 兼容性处理，直接返回字符串也可以
    return '您正在离开当前页面，确定要继续吗？';
  });
});

// endregion


</script>

<template>
  <div style="max-width: calc(100vw - 270px);">
    <a-space direction="vertical" style="width: 100%">
      <a-space>
        <a-button
          type="primary"
          @click="create()"
          v-if="
            workstationMessage?.workstationName.includes('打包') ||
            workstationMessage?.workstationName.includes('制粉') ||
            workstationMessage?.workstationName.includes('制釉') ||
            workstationMessage?.workstationName.includes('施釉')
          "
        >
          新增
        </a-button>
        <a-button
          type="primary"
          @click="submit(1)"
          :loading="submitLoading"
          :disabled="( workstationMessage?.workstationName.includes('制浆') ) && miscellaneousIncome && !zsStatus || overclaimStatus"
        >
<!--          :disabled="( workstationMessage?.workstationName.includes('制浆') || workstationMessage?.workstationName.includes('制色') ) && miscellaneousIncome"-->
          投料
        </a-button>
        <a-button
          type="primary"
          @click="submit(0)"
          :disabled="!miscellaneousIncome || zsStatus || overclaimStatus"
          :loading="miscellaneousIncomeLoading"
          v-if="workstationMessage?.workstationName.includes('制浆')">
          <!--        :disabled="!miscellaneousIncome"-->
          杂收(SAP)
        </a-button>
        <a-button type="dashed" @click="saveOptions()" :disabled="overclaimStatus">
          保存当前操作
        </a-button>
        <a-button type="dashed" danger @click="clearOptions()" :disabled="overclaimStatus" >
          清除已保存内容
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
        <vxe-column title="加料量" min-width="180" v-if="
          workstationMessage?.workstationName.includes('制粉') ||
          workstationMessage?.workstationName.includes('施釉') ||
          workstationMessage?.workstationName.includes('效果釉') ||
          workstationMessage?.workstationName.includes('制釉')"
        >
          <template #default="{ row }">
            {{getDryChargeSum(row)(1)}}
          </template>
        </vxe-column>
        <vxe-column title="湿料投入量" min-width="180" v-if="!(workstationMessage?.workstationName.includes('施釉') && workstationMessage?.workstationName.includes('制釉'))">
          <template #default="{ row }">
            {{obtainTheAmountOfWetMaterialInput(row)}}
          </template>
        </vxe-column>
        <vxe-column title="干料投入量" min-width="180" v-if="
          !(workstationMessage?.workstationName.includes('施釉') || workstationMessage?.workstationName.includes('制釉'))"
        >
          <template #default="{ row }">
            {{getDryChargeSum(row)()}}
          </template>
        </vxe-column>
        <vxe-column title="盘盈数量" min-width="180">
          <template #default="{ row }">
            {{getUnFeedNumberSum(row)}}
          </template>
        </vxe-column>
        <vxe-column title="操作" min-width="180" fixed="right">
          <template #default="{ row, rowIndex }">
            <a-button type="primary" @click="showFeed(row)" :disabled="overclaimStatus">
              加料
            </a-button>
            &nbsp;
            <a-button v-if="row.created" type="primary" @click="delRow(rowIndex)" danger :disabled="overclaimStatus">
              删除
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

        :label-col="{ span: 24 }"
        :wrapper-col="{ span: 24 }"
      >
        <a-row>
          <a-col :span="editItem.created ? 12 : 8">
            <a-form-item label="物料编号">
              <a-select
                v-model:value="editItem.materialCode"
                placeholder="输入编号进行查询"
                style="width: 100%;"
                :filter-option="false"
                :options="materialCodeList"
                @change="(_val: any, _item: any) => {
                  editItem.materialName = _item.label;
                  editItem.unit = _item.unit;
                  queryLibraryLocation();
                }"
                v-if="editItem.created"
              >
              </a-select>
              <span style="width: 160px;display: inline-block;" v-else>{{editItem.materialCode}}</span>
            </a-form-item>
          </a-col>
          <a-col :span="8" v-if="!editItem.created">
            <a-form-item label="物料名称">
              <span style="width: 100%;display: inline-block;">{{editItem.materialName}}</span>
            </a-form-item>
          </a-col>
          <a-col :span="8" v-if="!editItem.created">
            <a-form-item
              :label="!(
                workstationMessage?.workstationName.includes('制釉') ||
                workstationMessage?.workstationName.includes('施釉') ||
                workstationMessage?.workstationName.includes('效果釉') ||
                workstationMessage?.workstationName.includes('打包') ||
                workstationMessage?.workstationName.includes('制粉')) ? '标准干料量' : '标准投入量'
              "
            >
              <span style="width: 160px;display: inline-block;">{{editItem.materialDosage}}</span>
            </a-form-item>
          </a-col>
          <a-col :span="8" v-if="
          !(
            workstationMessage?.workstationName.includes('制釉') ||
            workstationMessage?.workstationName.includes('效果釉') ||
            workstationMessage?.workstationName.includes('施釉') ||
            workstationMessage?.workstationName.includes('打包') ||
            workstationMessage?.workstationName.includes('制粉')
          )">
            <a-form-item label="当前投入湿料量">
              <span  style="width: 160px;display: inline-block;">
                {{getDryChargeSum()(1)}}
              </span>
            </a-form-item>
          </a-col>
          <a-col :span="8" v-if="
          !(
            workstationMessage?.workstationName.includes('制釉') ||
            workstationMessage?.workstationName.includes('效果釉') ||
            workstationMessage?.workstationName.includes('施釉') ||
            workstationMessage?.workstationName.includes('打包') ||
            workstationMessage?.workstationName.includes('制粉'))">
            <a-form-item label="当前投入干料量">
              <span  style="width: 160px;display: inline-block;">
                {{getDryChargeSum()()}}
              </span>
            </a-form-item>
          </a-col>
          <a-col :span="8" >
            <a-form-item label="已投入干料量">
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
              workstationMessage?.workstationName.includes('制釉') ||
              workstationMessage?.workstationName.includes('效果釉') ||
              workstationMessage?.workstationName.includes('打包') ||
              workstationMessage?.workstationName.includes('制粉'))">
              <!-- 物料批次 -->
              <a-col :span="8">
                <a-form-item
                  label="物料批次"
                  :name="[index, 'batchCode']"
                  :rules="[{ required: true, message: '该项为必填项!' }]"
                >
                  <a-input v-model:value="item.batchCode" placeholder="物料批次" v-if="editItem.created"></a-input>

                  <a-select
                    v-model:value="item.batchCode"
                    show-search
                    placeholder="请选择"
                    style="width: 160px"
                    disabled
                    :options="editItem.batchCodes"
                    :field-names="{ label: 'batchCode', value: 'batchCode' }"
                    @change="(_v: any, _i: any) => {
                      item.waterNumber = _i.waterNumber;
                      item.areaCode = _i.areaCode;
                      item.warehouseCode = _i.warehouseCode;
                    }"
                    v-else
                  >
                  </a-select>
                </a-form-item>
              </a-col>
              <!-- 含水率 -->
              <a-col :span="8">
                <a-form-item
                  label="含水率"
                >
                  <a-input v-model:value="item.waterNumber" placeholder="含水率" v-if="editItem.created"></a-input>
                  <span style="display: inline-block;width: 160px;" v-else-if="item.waterNumber">
                    {{(item.waterNumber * 100).toFixed(2) }}%
                  </span>
                  <span style="display: inline-block;width: 160px;" v-else>
                    0
                  </span>
                </a-form-item>
              </a-col>
              <!-- SAP储位 -->
              <a-col :span="8">
                <a-form-item
                  label="SAP储位"
                >
                  <a-input v-model:value="item.areaCode" placeholder="SAP储位" v-if="editItem.created"></a-input>
                  <span style="display: inline-block;width: 160px;" v-else>
                    {{ item.areaCode }}
                  </span>
                </a-form-item>
              </a-col>
              <!-- SAP库位 -->
              <a-col :span="8">
                <a-form-item
                  label="SAP库位"
                >
                  <a-input v-model:value="item.warehouseCode" placeholder="SAP库位" v-if="editItem.created"></a-input>
                  <span style="display: inline-block;width: 160px;" v-else>
                    {{ item.warehouseCode }}
                  </span>
                </a-form-item>
              </a-col>
              <!-- 实际库位 -->
              <a-col :span="8">
                <a-form-item
                  label="实际库位"
                  v-if=" workstationMessage?.workstationName.includes('制浆')"
                >
                  <a-input v-model:value="item.sjWarehouseCode" placeholder="实际库位" v-if="editItem.created"></a-input>
                  <span style="display: inline-block;width: 160px;" v-else>
                    {{ item.sjWarehouseCode }}
                  </span>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-if="
              workstationMessage?.workstationName.includes('制釉') ||
              workstationMessage?.workstationName.includes('效果釉') ||
              workstationMessage?.workstationName.includes('施釉') ||
              (editItem.created && workstationMessage?.workstationName.includes('打包')) ||
              workstationMessage?.workstationName.includes('制粉')"
            >
              <!-- 物料批次 -->
              <a-col :span="12" v-if="editItem.materialTypeFlag">
                <a-form-item
                  label="物料批次"
                  :name="[index, 'batchCode']"
                  :rules="[{ required: true, message: '该项为必填项!' }]"
                >
                  <a-select
                    v-model:value="item.batchCode"
                    show-search
                    placeholder="请选择"
                    style="width: 160px"
                    :options="editItem.batchCodes"
                    :field-names="{ label: 'batchCode', value: 'batchCode' }"
                    @change="(_v: any, _i: any) => {
                      /*item.waterNumber = _i.waterNumber;
                      item.areaCode = _i.areaCode;
                      item.warehouseCode = _i.warehouseCode;*/
                      if (_v) {
                        let obj: any = {};
                        editItem.batchCodes.forEach((i: any) => {
                          if (i.batchCode === _v) {
                            obj = i;
                          }
                        });
                        if (obj) {
                          item.warehouseCodeAndNumber = `${obj.warehouseCode}`;
                          item.warehouseCode = obj.warehouseCode;
                          item.stockQuality = obj.stockQuality;
                        }
                      }
                    }"
                  >
                  </a-select>
                </a-form-item>
              </a-col>
              <!-- 库位 -->
              <a-col :span="16">
                <a-form-item
                  label="库位"
                  :name="[index, 'warehouseCode']"
                  :rules="[{ required: true, message: '该项为必填项!' }]"
                >
                  <a-select
                    v-model:value="item.warehouseCodeAndNumber"
                    show-search
                    placeholder="请选择"
                    style="width: 100%;"
                    :disabled="editItem.materialTypeFlag"
                    :options="warehouseCodeList"
                    @change="(value: any) => {
                      if (item.warehouseCodeAndNumber) {
                        let data = item.warehouseCodeAndNumber.split('&&');
                        item.warehouseCode = data[0];
                        item.stockQuality = data[1];
                        item.areaCode = data[2] ?? undefined;
                        item.batchCode = data[3] ?? undefined;
                      }
                    }"
                  >
                  </a-select>
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
              <a-col :span="8">
                <a-form-item
                  label="库存"
                >
                  <a-input-number
                    style="width: 160px;"
                    v-model:value="item.stockQuality"
                    placeholder="库存"
                    :addon-after="editItem.unit"
                    :min="0"
                    readonly
                  ></a-input-number>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="8" v-if="workstationMessage?.workstationName.includes('制浆')">
                <a-form-item
                  label="湿料标准投入量"
                >
                  <a-input-number
                    style="width: 160px;"
                    v-model:value="item.standardNumber"
                    placeholder="湿料标准投入量"
                    :addon-after="editItem.unit"
                    :min="0"
                    readonly
                  ></a-input-number>
                </a-form-item>
              </a-col>
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
                    :disabled="editItem.overtakingApproval"
                    :min="0"
                  ></a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="8" v-if="
              !(
                workstationMessage?.workstationName.includes('制釉') ||
                workstationMessage?.workstationName.includes('效果釉') ||
                workstationMessage?.workstationName.includes('施釉') ||
                workstationMessage?.workstationName.includes('打包') ||
                workstationMessage?.workstationName.includes('制粉'))">
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
              <a-col :span="8">
                <a-form-item
                  label="库存量"
                >
                  {{item.stockQuality ?? ''}}
                </a-form-item>
              </a-col>
              <a-col :span="8" v-if="item.batchCode && ( workstationMessage?.workstationName.includes('制粉') || workstationMessage?.workstationName.includes('制釉') || workstationMessage?.workstationName.includes('效果釉'))">
                <a-form-item
                  label="批次号"
                >
                  {{item.batchCode }}
                </a-form-item>
              </a-col>
              <a-col :span="8" v-if="item.areaCode && (workstationMessage?.workstationName.includes('制粉') || workstationMessage?.workstationName.includes('制釉') || workstationMessage?.workstationName.includes('效果釉'))">
                <a-form-item
                  label="储位"
                >
                  {{item.areaCode }}
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
      <a-button
        type="primary"
        @click="addFeedLine()"
        v-if="
        editItem.created ||
        workstationMessage?.workstationName.includes('施釉') ||
        workstationMessage?.workstationName.includes('效果釉') ||
        workstationMessage?.workstationName.includes('制釉') ||
        workstationMessage?.workstationName.includes('制粉')"
      style="width:100%">添加</a-button>

      <template #footer>
        <a-button style="margin-right: 8px" @click="close">取消</a-button>
        <a-button
          type="primary"
          @click="feedingCheck"
          :disabled="editItem.overtakingApproval"
          :loading="checkLoading"
        >
            提交
        </a-button>
      </template>
    </a-drawer>

  </div>
</template>

<style scoped lang="scss">

</style>
