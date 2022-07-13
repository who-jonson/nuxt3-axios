<template>
  <div>
    Nuxt module playground!
  </div>
</template>

<script lang="ts" setup>
const { $axios } = useNuxtApp();
const { data } = await useAsyncData('user', () => $axios.$get('https://jsonplaceholder.typicode.com/todos/1'));
console.log(data.value);
</script>
