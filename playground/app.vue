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

const { data } = await useAxiosGet<UserData>('https://jsonplaceholder.typicode.com/todos/1');
</script>
