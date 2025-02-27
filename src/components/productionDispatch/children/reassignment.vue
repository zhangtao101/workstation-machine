<script lang="ts" setup>

import { ref } from 'vue'
import { sendProduceCheck, sendProduct } from '@/services/work-order-disassembly-and-consolidation.service'
import { message } from 'ant-design-vue'


const emit = defineEmits(['send'])
// 设备编号
const deviceId = ref()
// 工单号
const workOrderNumber = ref()
// 工单ID
const workOrderId = ref()
// 数据对象
const obj = ref()
// 类型
const objType = ref(1)
// 是否显示
const isShow = ref(false)

/**
 * 模态框显示状态切换
 * @param equipCode 设备编号
 * @param workSheetCode 工单号
 * @param workSheetId
 * @param type 类型 1: 派工 2: 改派
 */
function toggle(equipCode: string, workSheetCode: string, workSheetId: string, type: number) {
  isShow.value = !isShow.value
  deviceId.value = equipCode
  workOrderNumber.value = workSheetCode
  workOrderId.value = workSheetId
  objType.value = type
  if (type === 1) {
    verify()
  }

}

/**
 * 派工 校验
 */
function verify() {
  sendProduceCheck({
    worksheetCode: workOrderNumber.value,
    equipCode: deviceId.value
  }).then(({ data }) => {
    if (data.code == 200) {
      obj.value = data.data
    } else {
      message.error({
      content: `操作失败请联系管理员${data.msg}`,

    })
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  })
}
const submitLoading = ref(false);
function send() {
  if (objType.value === 1) {
    submitLoading.value = true;
    sendProduct({
      id: workOrderId.value,
      equipCode: deviceId.value
    }).then(({ data }) => {
      if (data.code == 200) {
        message.success(`操作成功`)
        onClose()
        emit('send', '')
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
      submitLoading.value = false;
    })
  }
}

/**
 * 关闭抽屉
 */
function onClose() {
  isShow.value = false
}


defineExpose({
  toggle
})
</script>

<template>
  <a-drawer :height="400" :open="isShow" placement="bottom" title="工单操作" @close="onClose">
    <template #extra>
      <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
      <a-button type="primary" @click="send" :loading="submitLoading">确认</a-button>
    </template>
    <h2>基础信息</h2>
    <a-descriptions v-if="obj" bordered>
      <a-descriptions-item label="工单号">
        <span class="details_text">{{ obj.workSheetCode }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="产品编号">
        <span class="details_text">{{ obj.productCode }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="可派工数量">
        <span class="details_text">{{ obj.number + obj.unit }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="当前设备号">
        <span class="details_text">{{ obj.equipCode }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="已排工单数">
        <span class="details_text">{{ obj.waitSheetNumber }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="工待生产数量">
        <span class="details_text">{{ obj.waitProduceNumber }}</span>
      </a-descriptions-item>
    </a-descriptions>

<!--    <h2>校验信息</h2>
    <a-descriptions v-if="obj" bordered>
      <a-descriptions-item label="工序是否冲突">
        <span :class="{
          'success_text' : obj.proceFlag,
          'error_text' : !obj.proceFlag,
        }">{{ obj.proceFlag ? '正常' : '冲突' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="工装治具资源">
        <span :class="{
          'success_text' : obj.proceFlag,
          'error_text' : !obj.proceFlag,
        }">{{ obj.mouldFlag ? '正常' : '冲突' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="设备资源">
        <span :class="{
          'success_text' : obj.proceFlag,
          'error_text' : !obj.proceFlag,
        }">{{ obj.equipFlag ? '正常' : '冲突' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="物料资源">
        <span :class="{
          'success_text' : obj.proceFlag,
          'error_text' : !obj.proceFlag,
        }">{{ obj.materialFlag ? '正常' : '冲突' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="排期是否正常">
        <span :class="{
          'success_text' : obj.proceFlag,
          'error_text' : !obj.proceFlag,
        }">{{ obj.produceTimeFlag ? '正常' : '冲突' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="预计开工时间">
        <span class="details_text">{{ moment(obj.planStartTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
      </a-descriptions-item>
    </a-descriptions>-->
  </a-drawer>
</template>

<style lang="scss" scoped>
.details_text {
  color: black;
}

.success_text {
  color: green;
}

.error_text {
  color: red;
}
</style>
