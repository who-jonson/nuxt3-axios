<script lang="ts" setup>
import { onMounted, useAxios } from '#imports';

interface UserData {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const { execute } = useAxios<UserData>('/todos/1', {}, { immediate: false });

onMounted(async () => {
  const { data, error } = await execute();
  console.log(data, error);
});
</script>

<template>
  <div>
    Nuxt module playground!
  </div>
</template>
