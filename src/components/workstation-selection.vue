<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { getAllWorkstationList } from '@/services/workstation.service'
import { humanLogin, humanLogout } from '@/services/machine-summary.service'


// region 工作站信息及选择
// 工作站列表
const workList = ref<any>([]);
// 选中的工作站编号
const workstationCode = ref<any>('');
/**
 * 查询工作站
 */
function queryWork () {
  getAllWorkstationList().then(({ data: { code, data, msg } }) => {
    if (code == 200) {
      workList.value = [];
      data.forEach((item: any) => {
        workList.value.push({
          label: `${item.workstationName}-${item.stationTypeName}`,
          value: item.workstationCode
        })
      })
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  })
}

/**
 * 选择工作站
 */
function selectedWork() {
  localStorage.equipmentCode = workstationCode.value;
  workList.value.forEach((item: any) => {
    if (item.value == workstationCode.value) {
      localStorage.equipmentName = item.label;
    }
  })
  location.reload();
}

// endregion

onMounted(() => {
  queryWork();
})
</script>

<template>
  <div class="main-container" >

    <a-space direction="vertical">
      <!-- 工单信息及选择 -->
      <a-card :bordered="false" class="main-card">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="工作站" :span="2">
            <a-space>
              <a-select
                v-model:value="workstationCode"
                show-search
                placeholder=""
                style="width: 400px"
                :options="workList"
              ></a-select>
              <a-button type="primary" @click="selectedWork" :disabled="!workstationCode">确认选择</a-button>
            </a-space>
          </a-descriptions-item>
        </a-descriptions>
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
