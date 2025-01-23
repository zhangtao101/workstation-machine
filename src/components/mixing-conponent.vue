<script lang="ts" setup>

import dayjs from 'dayjs'
import { ref } from 'vue'

const isOpen = ref(false)
</script>

<template>
  <div class="container">
    <h3>
      当前工作站: xxxx
      <a-button v-if="!loginUser" style="position:absolute; right: 1em;" type="primary" @click="loginOpen = true;userName = ''">
        人员切换
      </a-button>
    </h3>
    <h3>当前信息: </h3>
    <a-descriptions>
      <a-descriptions-item label="人员">张三</a-descriptions-item>
      <a-descriptions-item label="工号">1234567</a-descriptions-item>
      <a-descriptions-item label="登入时间">{{ dayjs().format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
    </a-descriptions>

    <div class="work_order_information">
      <a-descriptions>
        <a-descriptions-item :span="3" label="工单号">
          <a-input />
        </a-descriptions-item>
        <a-descriptions-item label="物料批次">5555555</a-descriptions-item>
      </a-descriptions>
      <vxe-table
        :data="[{}]"
        header-align="center"
        header-cell-class-name="table_head"
        height="300"
      >
        <vxe-column type="seq" width="60"></vxe-column>
        <vxe-column field="name" min-width="120" title="物料批号"></vxe-column>
        <vxe-column field="sex" min-width="120" title="物料编号"></vxe-column>
        <vxe-column field="age" min-width="120" title="物流名称"></vxe-column>
        <vxe-column field="age" min-width="120" title="取样编号"></vxe-column>
        <vxe-column field="age" min-width="120" title="检验单号"></vxe-column>
        <vxe-column field="age" min-width="120" title="检验结果"></vxe-column>
        <vxe-column field="age" min-width="120" title="投料数量"></vxe-column>
        <vxe-column field="age" min-width="120" title="投料时间"></vxe-column>
      </vxe-table>
    </div>

    <div class="material_information">
      <a-descriptions>
        <a-descriptions-item :span="3" label="物料标签">
          <a-input />
        </a-descriptions-item>
        <a-descriptions-item label="物料批次">5555555</a-descriptions-item>
        <a-descriptions-item label="物料编号">5555555</a-descriptions-item>
        <a-descriptions-item label="物料名称">5555555</a-descriptions-item>
        <a-descriptions-item label="当前重量">5555555</a-descriptions-item>
        <a-descriptions-item class="key_point_text" label="取样批号">5555555</a-descriptions-item>
        <a-descriptions-item :span="0.5" class="key_point_text" label="检验单号">5555555</a-descriptions-item>
        <a-descriptions-item :class="{
          success_text: true,
          error_text: false
        }" :span="0.5" label="检验结果">123
        </a-descriptions-item>
      </a-descriptions>

      <div class="operation">
        <a-button type="primary" @click="isOpen = true">投料</a-button>
      </div>
    </div>
  </div>


</template>

<style lang="scss" scoped>
.container {
  padding: .2em 1em;

  .work_order_information {
    background: #efefef;
    border-radius: 1em;
    box-sizing: border-box;
    padding: 1em;
  }

  .material_information {
    margin: 2em 0;
    background: #bfe5f8;
    border-radius: 1em;
    box-sizing: border-box;
    padding: 1em;
  }

  .operation {
    margin-top: 1em;
    text-align: right;
  }
}

:deep(.key_point_text) {
  .ant-descriptions-item-content {
    color: #091fb4 !important;
    font-weight: bold;
  }
}

:deep(.success_text) {
  .ant-descriptions-item-content {
    color: #2cfd00;
    font-weight: bold;
  }
}

:deep(.error_text) {
  .ant-descriptions-item-content {
    color: red;
    font-weight: bold;
  }
}
</style>
