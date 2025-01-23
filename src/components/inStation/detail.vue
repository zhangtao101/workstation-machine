<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { proceSetDetailById } from '@/services/workstation.service'
import { message } from 'ant-design-vue'
import ProcessOperation from '@/components/inStation/process-operation.vue'
import GetMaterialsOperation from '@/components/inStation/get-materials-operation.vue'
import StorageOperation from '@/components/inStation/storage-operation.vue'
import MovingOperation from '@/components/inStation/moving-operation.vue'
import ProcessConfigurationOperation from '@/components/inStation/process-configuration-operation.vue'
import ProcessAcquisitionOperation from '@/components/inStation/process-acquisition-operation.vue'
import EnergyConsumptionCollectionOperation from '@/components/inStation/energy-consumption-collection-operation.vue'
import ReportForWorkOperation from '@/components/inStation/report-for-work-operation.vue'
import FeedingOperation from '@/components/inStation/feeding-operation.vue'

const props = defineProps({
  id: {
    type: Number,
    required: true
  },
  processName: {
    type: String,
    required: true
  },
  equipt: {
    type: Array<Object>,
    required: false,
    default: [] as any[]
  },
  equipCodeList: {
    type: Array<Object>,
    required: false,
    default: [] as any[]
  },
  sheetMessage: {
    type: Object,
    required: false,
    default: {} as any
  },
  workstationMessage: {
    type: Object,
    required: false,
    default: {} as any
  },
  unitMessage: {
    type: String,
    required: false,
    default: ''
  }
})
// 操作详细
const operationDetails = ref<any>([])
// 操作详细加载状态
const operationDetailsLoading = ref<any>(false)
// 当前选中的操作
const activeItem = ref<any>({})
// 选中的类型
const checkedType = ref<number>(-1)

/**
 * 选中操作
 * @param item
 */
function checkItem(item: any) {
  activeItem.value = -1
  checkedType.value = -1
  setTimeout(() => {
    activeItem.value = item.id
    checkedType.value = item.opType
  }, 200)
}

onMounted(() => {
  operationDetailsLoading.value = true
  proceSetDetailById(props.id)
    .then(({ data: { code, data, msg } }) => {
      if (code == 200) {
        operationDetails.value = data
        if (data.length > 0) {
          checkItem(data[0])
        }
      } else {
        message.error({
          content: `操作失败请联系管理员${msg}`
        })
      }
    })
    .catch((err) => {
      message.error({
        content: `操作失败请联系管理员,${err.message ? err.message : err}`
      })
    })
    .finally(() => {
      operationDetailsLoading.value = false
    })
})
</script>

<template>
  <a-spin :spinning="operationDetailsLoading">
    <div style="min-height: 200px">
      <div class="operation-list">
        <a-space size="large">
          <template v-for="item of operationDetails" :key="item.id">
            <div
              :class="{
                'operation-list-item': true,
                'operation-list-item-active': item.id == activeItem
              }"
              @click="checkItem(item)"
            >
              {{ item.opTypeName }}
            </div>
          </template>
          <div
            :class="{
              'operation-list-item': true,
              'operation-list-item-active': 99 == activeItem
            }"
            @click="checkItem({
              id: 99,
              opType: 99
             })"
            v-if="processName === '配送'"
          >
            料仓查看
          </div>
        </a-space>
      </div>

      <!--     过程操作-->
      <template v-if="checkedType == 1">
        <process-operation
          :id="id"
          :opsetDetailId="activeItem"
          :equipt="equipt"
          :sheetMessage="sheetMessage"
        />
      </template>
      <!-- 投料操作 -->
      <template v-if="checkedType == 2">
        <feeding-operation
          :id="id"
          :opsetDetailId="activeItem"
          :workstationMessage="workstationMessage"
          :sheetMessage="sheetMessage"
        />
      </template>
      <!-- 领料操作 -->
      <template v-if="checkedType == 3">
        <get-materials-operation
          :id="id"
          :opsetDetailId="activeItem"
          :workstationMessage="workstationMessage"
          :sheetMessage="sheetMessage"
        />
      </template>
      <!-- 入库操作 -->
      <template v-if="checkedType == 4">
        <storage-operation
          :id="id"
          :opsetDetailId="activeItem"
          :workstationMessage="workstationMessage"
          :sheetMessage="sheetMessage"
          :unitMessage="unitMessage"
        />
      </template>
      <!-- 流转操作 -->
      <template v-if="checkedType == 5">
        <moving-operation
          :id="id"
          :opsetDetailId="activeItem"
          :workstationMessage="workstationMessage"
          :sheetMessage="sheetMessage"
          :unitMessage="unitMessage"
        />
      </template>
      <!-- 工艺配置操作 -->
      <template v-if="checkedType == 6">
        <process-configuration-operation
          :id="id"
          :opsetDetailId="activeItem"
          :workstationMessage="workstationMessage"
          :sheetMessage="sheetMessage"
        />
      </template>
      <!-- 工艺采集操作 -->
      <template v-if="checkedType == 7">
        <process-acquisition-operation
          :id="id"
          :opsetDetailId="activeItem"
          :workstationMessage="workstationMessage"
          :sheetMessage="sheetMessage"
        />
      </template>
      <!-- 能耗采集操作 -->
      <template v-if="checkedType == 8">
        <energy-consumption-collection-operation
          :id="id"
          :opsetDetailId="activeItem"
          :workstationMessage="workstationMessage"
          :sheetMessage="sheetMessage"
          :equipCodeList="equipCodeList"
        />
      </template>
      <!-- 报工操作 -->
      <template v-if="checkedType == 9">
        <report-for-work-operation
          :id="id"
          :checkedTypeName="processName"
          :opsetDetailId="activeItem"
          :workstationMessage="workstationMessage"
          :sheetMessage="sheetMessage"
          :unitMessage="unitMessage"
        />
      </template>
      <!-- 报工操作 -->
      <template v-if="checkedType == 99">
        <report-for-work-operation
          :id="id"
          :checkedTypeName="processName"
          :opsetDetailId="activeItem"
          :workstationMessage="workstationMessage"
          :sheetMessage="sheetMessage"
          :unitMessage="unitMessage"
        />
      </template>
    </div>
  </a-spin>
</template>

<style scoped lang="scss">
.operation-list {
  overflow-x: auto;
  overflow-y: hidden;
  width: calc(100vw - 300px);
  white-space: nowrap;
  padding: 1em;
  height: 6em;
  margin-bottom: 3em;
  & > span {
    margin: 0 1em;
  }
  .operation-list-item {
    display: inline-block;
    padding: 1em;

    border-radius: 11px;
    background: #ffffff;
    box-shadow:
      3px 7px 12px #d9d9d9,
      -4px -4px 6px #ffffff;
    cursor: pointer;
    &.operation-list-item-active {
      background: #61a6ff;
      box-shadow:
        3px 7px 12px #61a6ff,
        -4px -4px 6px #61a6ff;
    }
  }
}
</style>
