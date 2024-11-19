<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let currentComment: string;
    export let isOpen: boolean;

    const dispatch = createEventDispatcher();
    let newComment: string = currentComment;

    const handleSave = () => {
        dispatch("save", newComment);
        closeModal();
    };

    const closeModal = () => {
        dispatch("close");
    };
</script>

{#if isOpen}
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl transform transition-all">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6">Edit Comment</h3>
        <textarea
            class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            bind:value={newComment}
            rows="5"
            placeholder="Enter your comment..."
        ></textarea>
        <div class="flex justify-end space-x-4">
            <button class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors" on:click={closeModal}>
                Cancel
            </button>
            <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" on:click={handleSave}>
                Save
            </button>
        </div>
    </div>
</div>
{/if}
