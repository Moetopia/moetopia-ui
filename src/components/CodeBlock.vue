<script setup lang="ts">
import CopyButton from './CopyButton.vue'
import { computed } from 'vue'
const props = defineProps<{ title: string; code: string; copyLabel: string; copiedLabel: string; errorLabel: string }>()

const tokens = computed(() => {
  const code = props.code
  const tokens = []
  let end = 0
  const pattern = /(?<string>"(?:\\[\s\S]|[^"\\])*")|(?<keyword>\b(?:curl|GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b|--[\w-]+)|(?<literal>\b(?:true|false|null)\b|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(?<parameter>[\w-]+(?==))/g
  const structured = /^\s*[{\[]/.test(code)
  if (!structured && !/^\s*(?:curl\s|(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s)/.test(code)) return [{ text: code }]
  for (const match of code.matchAll(pattern)) {
    if (match.index > end) tokens.push({ text: code.slice(end, match.index) })
    end = match.index + match[0].length
    const kind = match.groups?.string
      ? structured && /^\s*:/.test(code.slice(end)) ? 'parameter' : 'string'
      : match.groups?.keyword ? 'keyword' : match.groups?.parameter ? 'parameter' : 'literal'
    tokens.push({ text: match[0], kind })
  }
  if (end < code.length) tokens.push({ text: code.slice(end) })
  return tokens
})
</script>
<template><section class="moe-code-block"><header><span>{{ title }}</span><CopyButton :value="code" :label="copyLabel" :copied-label="copiedLabel" :error-label="errorLabel" /></header><pre tabindex="0"><code><span v-for="(token, index) in tokens" :key="index" :data-token="token.kind">{{ token.text }}</span></code></pre></section></template>

<style scoped>
.moe-code-block [data-token='keyword'] { color: var(--moe-primary-ink); font-weight: 600; }
.moe-code-block [data-token='parameter'] { color: var(--moe-info); }
.moe-code-block [data-token='string'] { color: var(--moe-success); }
.moe-code-block [data-token='literal'] { color: var(--moe-warning); }
</style>
