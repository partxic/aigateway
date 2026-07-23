import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/view/Login.vue')
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('@/view/Dashboard.vue'),
            children: [
                {
                    path: 'account-manage',
                    name: 'account-manage',
                    meta: {
                        tab: '账号管理'
                    },
                    component: () => import('@/view/dashboard/AccountManage.vue')
                },
                {
                    path: 'user-manage',
                    name: 'user-manage',
                    meta: {
                        tab: '用户管理'
                    },
                    component: () => import('@/view/dashboard/UserManage.vue')
                },
                {
                    path: 'provider-manage',
                    name: 'provider-manage',
                    meta: {
                        tab: '供应管理'
                    },
                    component: () => import('@/view/dashboard/ProviderManage.vue')
                }
            ]
        }
    ]
})
