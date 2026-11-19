<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch, watchEffect } from 'vue'
import Alert from './Alert.vue'
import Button from './Button.vue'
import Dialog from './Dialog.vue'

const props = withDefaults(defineProps<{
  file: File
  open?: boolean
  size?: number
  title?: string
  zoomLabel?: string
  horizontalLabel?: string
  verticalLabel?: string
  confirmLabel?: string
  cancelLabel?: string
  errorLabel?: string
  dragHint?: string
  resetLabel?: string
  loading?: boolean
}>(), {
  open: true,
  size: 256,
  title: '裁剪头像',
  zoomLabel: '缩放',
  horizontalLabel: '水平位置',
  verticalLabel: '垂直位置',
  confirmLabel: '上传头像',
  cancelLabel: '取消',
  errorLabel: '图片无法读取，请重新选择。',
  dragHint: '',
  resetLabel: '',
  loading: false,
})

const emit = defineEmits<{ cancel: []; confirm: [base64: string] }>()

const canvas = ref<HTMLCanvasElement>()
const stage = ref<HTMLDivElement>()
const image = shallowRef<HTMLImageElement>()
const failed = ref(false)
const zoom = ref(1)
const horizontal = ref(50)
const vertical = ref(50)
const dragging = ref(false)
let pointerId: number | undefined
let dragStart = { x: 0, y: 0, h: 50, v: 50 }

const canPanX = computed(() => !!image.value && (zoom.value > 1 || image.value.naturalWidth > image.value.naturalHeight))
const canPanY = computed(() => !!image.value && (zoom.value > 1 || image.value.naturalHeight > image.value.naturalWidth))
const dirty = computed(() => zoom.value !== 1 || horizontal.value !== 50 || vertical.value !== 50)
const zoomText = computed(() => `${zoom.value.toFixed(1)}×`)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const reset = () => {
  zoom.value = 1
  horizontal.value = 50
  vertical.value = 50
}

const loadFile = async (file: File) => {
  image.value = undefined
  failed.value = false
  reset()
  const source = URL.createObjectURL(file)
  try {
    const decoded = new Image()
    decoded.src = source
    await decoded.decode()
    image.value = decoded
  } catch {
    failed.value = true
  } finally {
    URL.revokeObjectURL(source)
  }
}

onMounted(() => { void loadFile(props.file) })
watch(() => props.file, file => { void loadFile(file) })

watchEffect(() => {
  const picture = image.value
  const context = canvas.value?.getContext('2d')
  if (!picture || !context) return
  const side = Math.min(picture.naturalWidth, picture.naturalHeight) / zoom.value
  const x = (picture.naturalWidth - side) * horizontal.value / 100
  const y = (picture.naturalHeight - side) * vertical.value / 100
  context.clearRect(0, 0, props.size, props.size)
  context.drawImage(picture, x, y, side, side, 0, 0, props.size, props.size)
}, { flush: 'post' })

const onPointerDown = (event: PointerEvent) => {
  if (!image.value || failed.value || event.button > 0) return
  if (!canPanX.value && !canPanY.value) return
  pointerId = event.pointerId
  dragging.value = true
  dragStart = { x: event.clientX, y: event.clientY, h: horizontal.value, v: vertical.value }
  stage.value?.setPointerCapture(event.pointerId)
}

const onPointerMove = (event: PointerEvent) => {
  if (!dragging.value || event.pointerId !== pointerId || !image.value || !stage.value) return
  const rect = stage.value.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return
  const picture = image.value
  const side = Math.min(picture.naturalWidth, picture.naturalHeight) / zoom.value
  const maxOffsetX = picture.naturalWidth - side
  const maxOffsetY = picture.naturalHeight - side
  const dx = (event.clientX - dragStart.x) * (side / rect.width)
  const dy = (event.clientY - dragStart.y) * (side / rect.height)
  if (maxOffsetX > 0.5) horizontal.value = clamp(Math.round(dragStart.h - (dx / maxOffsetX) * 100), 0, 100)
  if (maxOffsetY > 0.5) vertical.value = clamp(Math.round(dragStart.v - (dy / maxOffsetY) * 100), 0, 100)
}

const endDrag = (event: PointerEvent) => {
  if (event.pointerId !== pointerId) return
  dragging.value = false
  pointerId = undefined
  if (stage.value?.hasPointerCapture(event.pointerId)) stage.value.releasePointerCapture(event.pointerId)
}

const onWheel = (event: WheelEvent) => {
  if (!image.value || failed.value) return
  event.preventDefault()
  const delta = event.deltaY < 0 ? 0.12 : -0.12
  zoom.value = Number(clamp(zoom.value + delta, 1, 4).toFixed(2))
}

const confirm = () => {
  if (!image.value || !canvas.value || props.loading) return
  try {
    const data = canvas.value.toDataURL('image/png').split(',')[1]
    if (!data || !canvas.value.getContext('2d')) throw new Error()
    emit('confirm', data)
  } catch {
    failed.value = true
  }
}

onBeforeUnmount(() => { dragging.value = false; pointerId = undefined })
</script>

<template>
  <Dialog :open="open" :title="title" :close-label="cancelLabel" :show-close-action="false" @update:open="value => { if (!value) emit('cancel') }">
    <div class="grid gap-4">
      <div
        v-show="image && !failed"
        ref="stage"
        class="moe-crop-stage"
        :data-dragging="dragging"
        :data-pannable="canPanX || canPanY"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="endDrag"
        @pointercancel="endDrag"
        @wheel="onWheel"
        @dblclick="reset"
      >
        <canvas ref="canvas" :width="size" :height="size" class="moe-crop-canvas" role="img" :aria-label="title" />
        <div class="moe-crop-mask" aria-hidden="true" />
        <div class="moe-crop-grid" aria-hidden="true"><span /><span /><span /><span /></div>
      </div>

      <Alert v-if="failed" :title="errorLabel" color="danger" announce />

      <fieldset v-else class="grid gap-3" :disabled="!image || loading">
        <div class="flex items-center justify-between gap-2 text-xs text-muted">
          <span v-if="dragHint">{{ dragHint }}</span>
          <span v-else>{{ zoomLabel }}: {{ zoomText }}</span>
          <div class="flex items-center gap-2">
            <span class="tabular-nums font-medium text-foreground">{{ zoomText }}</span>
            <Button v-if="resetLabel" size="sm" variant="light" color="default" :disabled="!dirty || loading" @click="reset">{{ resetLabel }}</Button>
          </div>
        </div>
        <label class="moe-crop-slider">
          <span class="text-xs font-medium text-muted">{{ zoomLabel }}</span>
          <input v-model.number="zoom" class="moe-crop-range" type="range" min="1" max="4" step="0.01" />
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="moe-crop-slider">
            <span class="text-xs font-medium text-muted">{{ horizontalLabel }}</span>
            <input v-model.number="horizontal" class="moe-crop-range" type="range" min="0" max="100" :disabled="!canPanX" />
          </label>
          <label class="moe-crop-slider">
            <span class="text-xs font-medium text-muted">{{ verticalLabel }}</span>
            <input v-model.number="vertical" class="moe-crop-range" type="range" min="0" max="100" :disabled="!canPanY" />
          </label>
        </div>
      </fieldset>

      <div class="flex justify-end gap-3 pt-1">
        <Button variant="light" color="default" :disabled="loading" @click="emit('cancel')">{{ cancelLabel }}</Button>
        <Button :disabled="!image || failed" :loading="loading" @click="confirm">{{ confirmLabel }}</Button>
      </div>
    </div>
  </Dialog>
</template>
