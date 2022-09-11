<template>
  <div>
    Nuxt module playground!
  </div>
</template>

<script lang="ts" setup>
import { useAxiosGet } from '#imports';

interface UserData {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const { data, error } = await useAxiosGet<UserData, Error>('/api/error', {
  lazy: true
});
console.log(data, error);
</script>
