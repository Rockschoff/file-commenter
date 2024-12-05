<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let message: string = "Are you sure?";
    export let confirmButtonText: string = "Confirm";
    export let cancelButtonText: string = "Cancel";

    function confirmAction() {
        dispatch("confirm");
    }

    function cancelAction() {
        dispatch("cancel");
    }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-[90vw] sm:w-[50vw] max-w-md">
        <div class="space-y-4">
            <h2 class="text-lg font-bold text-gray-800">{message}</h2>
            <div class="flex justify-end space-x-4">
                <button
                    class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all"
                    on:click={cancelAction}
                >
                    {cancelButtonText}
                </button>
                <button
                    class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    on:click={confirmAction}
                >
                    {confirmButtonText}
                </button>
            </div>
        </div>
    </div>
</div>
