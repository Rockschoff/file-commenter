<script lang="ts">
    import { currentPath } from "../../stores/stores";
    import { loadCurrentFileList } from "$lib/backend";

    function navigateTo(path: string) {
        currentPath.set(path);
        loadCurrentFileList();
    }
</script>

<div class="flex items-center bg-gray-100 p-4 rounded-lg mb-6 text-gray-600 text-sm">
    <span
        class="cursor-pointer hover:text-blue-500"
        on:click={() => navigateTo("/")}
    >
        Home
    </span>
    {#each $currentPath.split("/").filter(Boolean) as segment, index}
        <svg class="w-4 h-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span
            class="cursor-pointer hover:text-blue-500"
            on:click={() => navigateTo($currentPath.split("/").slice(0, index + 1).join("/") || "/")}
        >
            {segment}
        </span>
    {/each}
</div>
