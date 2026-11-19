import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import AvatarCrop from './AvatarCrop.vue'
import Button from './Button.vue'

const createSampleFile = async () => {
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 320
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 480, 320)
    gradient.addColorStop(0, '#24796f')
    gradient.addColorStop(1, '#586581')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 480, 320)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('M', 240, 160)
  }
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
  return new File([blob ?? new Blob()], 'sample-avatar.png', { type: 'image/png' })
}

const meta = {
  title: 'Overlays/AvatarCrop',
  component: AvatarCrop,
  tags: ['autodocs'],
} satisfies Meta<typeof AvatarCrop>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { AvatarCrop, Button },
    setup() {
      const file = ref<File>()
      const preview = ref('')
      const openDemo = async () => { file.value = await createSampleFile() }
      const onConfirm = (base64: string) => { preview.value = `data:image/png;base64,${base64}`; file.value = undefined }
      return { file, preview, openDemo, onConfirm }
    },
    template: `
      <div class="grid gap-4">
        <Button @click="openDemo">打开头像裁剪器</Button>
        <img v-if="preview" :src="preview" alt="裁剪结果" class="size-20 rounded-full border border-line" />
        <AvatarCrop v-if="file" :file="file" drag-hint="拖动图片调整位置，滚轮或滑块缩放" reset-label="重置" @cancel="file = undefined" @confirm="onConfirm" />
      </div>
    `,
  }),
}
