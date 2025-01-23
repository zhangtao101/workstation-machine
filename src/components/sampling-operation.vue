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
        <a-descriptions-item :span="2" label="工单号">
          <a-input />
        </a-descriptions-item>
        <a-descriptions-item :span="1" label="设备号">
          <a-input />
        </a-descriptions-item>
        <a-descriptions-item label="设备号">5555555</a-descriptions-item>
        <a-descriptions-item label="设备名称">5555555</a-descriptions-item>
        <a-descriptions-item label="当前工单号">5555555</a-descriptions-item>
      </a-descriptions>
    </div>

    <div class="material_information">
      <h3>取样明细</h3>
      <a-descriptions>
        <a-descriptions-item label="样本数量">
          <a-input-number :min="0" addon-after="g" />
        </a-descriptions-item>
        <a-descriptions-item label="取样类型">5555555</a-descriptions-item>
        <a-descriptions-item label="取样数量">
          <a-input-number :min="0" addon-after="g" />
        </a-descriptions-item>
        <a-descriptions-item label="标签模板">5555555</a-descriptions-item>
      </a-descriptions>

      <div class="operation">
        <a-button type="primary">生产标签</a-button>
        <a-button type="primary">取样完成</a-button>
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
    display: flex;
    justify-content: space-between;
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
