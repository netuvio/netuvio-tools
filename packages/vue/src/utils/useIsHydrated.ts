import { onMounted, readonly, ref } from "vue";

export function useIsHydrated() {
    const isHydrated = ref(false);

    onMounted(() => {
        isHydrated.value = true;
    });

    return readonly(isHydrated);
}

export default useIsHydrated;
