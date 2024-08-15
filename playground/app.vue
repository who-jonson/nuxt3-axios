<script lang="ts" setup>
import { useAxios } from '#imports';

interface UserData {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const { data, error } = await useAxios<UserData>('/todos/1', {}, { immediate: true });

console.log(data.value, error.value);

// onMounted(async () => {
//   // const { data, error } = await execute();
//
// });
</script>

<template>
  <div>
    Nuxt module playground!
  </div>
</template>
