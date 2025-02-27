<script setup lang="ts">
import { ref } from 'vue';
import { humanLogin } from '@/services/machine-summary.service'

const formState = ref<any>({});

function onFinish() {
  humanLogin(formState.value.username).then(() => {
    localStorage.setItem('username', formState.value.username);
    location.reload();
  });
}
</script>

<template>
 <a-card class="login-card">
   <a-form
     :model="formState"
     name="normal_login"
     @finish="onFinish"
   >
     <a-form-item
       label="用户工号"
       name="username"
       :rules="[{ required: true, message: 'Please input your username!' }]"
     >
       <a-input v-model:value="formState.username">
         <template #prefix>
           <UserOutlined class="site-form-item-icon" />
         </template>
       </a-input>
     </a-form-item>
     <a-form-item :offset="8">
       <a-button :disabled="!formState.username" type="primary" html-type="submit" class="login-form-button">
         登录
       </a-button>
     </a-form-item>
   </a-form>
 </a-card>
</template>

<style scoped lang="scss">
.login-card {
  width: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .login-form-button {
    width: 100%;
  }
}
</style>