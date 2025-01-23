<script setup lang="ts">

// region 工序树

import type { RadioGroupProps, TreeProps } from 'ant-design-vue'
import { h, ref } from 'vue'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
// 工序节点数据
const treeData: TreeProps['treeData'] = [
  {
    title: '全部',
    key: '0',
    children: [
      {
        title: '贴片',
        key: '15',
      },
      {
        title: '制浆',
        key: '16',
        children: [
          {
            key: '17',
            title: '喷干制粉'
          },
          {
            key: '18',
            title: '料仓仓储'
          },
        ],
      },
    ],
  },
];
// 展开的节点
const selectedKeys = ref<string[]>(['0']);


// endregion

// region 表格操作
// 表格数据
const tableData = ref<any[]>([{}]);

/**
 * 编辑
 * @param row 单元行数据
 */
function editItem(row: any) {

}

/**
 * 删除
 * @param row 删除单元行
 */
function deleteItem(row: any) {

}

// endregion

// region 新增/编辑
// 抽屉是否打开
const isOpen = ref(false);
// 编辑的对象
const editData = ref<any>({});
// 表单验证的规则
const editRules = ref<any>({
  name: [
    { required: true, message: 'Please input Activity name', trigger: 'change' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
  ],
});
// 过程类型
const procedureType = ref<{
  label: string,
  value: number,
}[]>([
  {
    label: '一般过程',
    value: 1,
  }
]);

// 单选选项
const optionsWithDisabled: RadioGroupProps['options'] = [
  { label: '是', value: true },
  { label: '否', value: false },
];

/**
 * 抽屉状态变更时调用, 用来在关闭的时候设置初始状态
 * @param open
 */
function afterOpenChange(open: boolean) {
  if(!open) {
    editData.value = {};
  }
}

// endregion

</script>

<template>
  <a-space :size="20" class="main">
    <a-card style="width: 250px;">
      <a-tree
        v-model:selectedKeys="selectedKeys"
        :tree-data="treeData"
      ></a-tree>
    </a-card>

    <a-card style="width: calc(100vw - 500px);">
      <!-- region 按钮集合 -->
      <div class="button-list">
        <a-button type="primary" @click="isOpen = true">新增</a-button>
      </div>
      <!-- region 按钮集合 -->

      <vxe-table
        border
        height="160"
        :data="tableData"
        style="margin-top: 2em;"
      >
        <vxe-column min-width="50" type="seq"></vxe-column>
        <vxe-column field="qrCode" min-width="120" title="过程编码"></vxe-column>
        <vxe-column field="message" min-width="120" title="过程名称"></vxe-column>
        <vxe-column field="time" min-width="90" title="特殊过程"></vxe-column>
        <vxe-column field="time" min-width="90" title="关键过程"></vxe-column>
        <vxe-column field="time" min-width="90" title="计划节点"></vxe-column>
        <vxe-column field="time" min-width="90" title="经验时间"></vxe-column>
        <vxe-column field="time" min-width="90" title="过程类型"></vxe-column>
        <vxe-column field="time" min-width="90" title="父过程名称"></vxe-column>
        <vxe-column field="time" min-width="90" title="报工节点"></vxe-column>
        <vxe-column field="time" min-width="90" title="创建时间"></vxe-column>
        <vxe-column field="time" min-width="90" title="操作时间"></vxe-column>
        <vxe-column field="time" min-width="90" title="操作" fixed="right">
          <template #default="{row}">
            <a-space >
              <!-- 编辑 -->
              <a-button type="primary" :icon="h(EditOutlined)" @click="editItem(row)"/>
              <!-- 删除 -->
              <a-button type="primary" danger :icon="h(DeleteOutlined)" @click="deleteItem(row)" />
            </a-space>
          </template>
        </vxe-column>
      </vxe-table>
    </a-card>
  </a-space>

  <!-- 新增/编辑 -->
  <a-drawer
    v-model:open="isOpen"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    placement="right"
    title="基本信息编辑"
    @after-open-change="afterOpenChange"
  >
    <a-form
      ref="formRef"
      :model="editData"
      :rules="editRules"
      :label-col="{span:5}"
    >
      <a-form-item ref="name" label="过程名称" name="name">
        <a-input v-model:value="editData.name" />
      </a-form-item>
      <a-form-item ref="name" label="过程编码" name="name">
        <a-input v-model:value="editData.name" />
      </a-form-item>
      <a-form-item ref="name" label="父过程名称" name="name">
        <a-input v-model:value="editData.name" />
      </a-form-item>
      <a-form-item ref="name" label="父过程编码" name="name">
        <a-input v-model:value="editData.name" readonly/>
      </a-form-item>
      <a-form-item ref="name" label="过程类型" name="name">
        <a-select v-model:value="editData.name" >
          <a-select-option
            v-for="item of procedureType"
            :value="item.value"
            :key="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item ref="name" label="报工节点" name="name">
        <a-radio-group v-model:value="editData.name" :options="optionsWithDisabled" />

      </a-form-item>

      <a-form-item ref="name" label="报工节点" name="name">
        <a-input-number :min="0" />
        <span style="vertical-align: middle;margin-left: 1em;">
          时间单位: 秒
        </span>
      </a-form-item>
      <a-form-item ref="name" label="关键过程" name="name">
        <a-radio-group v-model:value="editData.name" :options="optionsWithDisabled" />
      </a-form-item>
      <a-form-item ref="name" label="特殊过程" name="name">
        <a-radio-group v-model:value="editData.name" :options="optionsWithDisabled" />
      </a-form-item>
      <a-form-item ref="name" label="计划节点" name="name">
        <a-radio-group v-model:value="editData.name" :options="optionsWithDisabled" />
      </a-form-item>
      <a-form-item ref="name" label="备注" name="name">
        <a-textarea></a-textarea>

      </a-form-item>

    </a-form>

    <template #footer>
      <a-space>
        <a-button >取消</a-button>
        <a-button type="primary" >提交</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<style scoped lang="scss">
.main {
  justify-items: start;
  align-items: flex-start;
  margin-top: 1em;

  .button-list {

  }
}
</style>
