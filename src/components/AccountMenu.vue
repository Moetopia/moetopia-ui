<script setup lang="ts">
import type { MoeMenuItem } from '../types'
import Avatar from './Avatar.vue'
import Dropdown from './Dropdown.vue'
defineProps<{ label: string; name: string; email: string; src?: string; items: MoeMenuItem[] }>()
defineEmits<{ select: [item: MoeMenuItem] }>()
</script>
<template>
  <Dropdown :label="label" :heading="email" :items="items" @select="item => $emit('select', item)">
    <template #header>
      <div class="moe-account-header">
        <Avatar :name="name" :src="src" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-foreground">{{ name }}</p>
          <p class="truncate text-xs text-muted">{{ email }}</p>
        </div>
      </div>
    </template>
    <button type="button" class="moe-account-trigger moe-focus" :aria-label="label"><Avatar :name="name" :src="src" size="sm" /></button>
  </Dropdown>
</template>
