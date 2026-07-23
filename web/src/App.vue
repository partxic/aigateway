<script setup>
document.title = '加载中...'

import { ref, watch, onMounted } from 'vue'
import BackendValidator from '@/components/BackendValidator.vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const backendOk = ref(false)
const router = useRouter()
const route = useRoute()

onMounted(async () => {
    await router.isReady()

    watch(
        backendOk,
        async isOk => {
            if (!isOk) return

            try {
                const res = await axios.get('/api/auth/status')

                ElMessage.success(res.data)
                if (!route.name || route.name === 'login') router.push({ name: 'dashboard' })
            } catch (error) {
                ElMessage.error(error.response.data)
                router.push({ name: 'login' })
            }
        },
        { immediate: true }
    )
})
</script>

<template>
    <BackendValidator v-model="backendOk" />
    <router-view v-if="backendOk" />
</template>

<style scoped></style>
