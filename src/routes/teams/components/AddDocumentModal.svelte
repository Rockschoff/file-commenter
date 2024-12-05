<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { getMatchingS3Keys } from "$lib/backend";

    const dispatch = createEventDispatcher();

    let searchTerm: string = "";
    let searchResults: string[] = [];
    let selectedKey: string | null = null;

    export let documents: string[] = [];

    async function handleSearch() {
        if (!searchTerm.trim()) {
            alert("Please enter a valid search term!");
            return;
        }
        try {
            searchResults = await getMatchingS3Keys(searchTerm);
        } catch (error) {
            console.error("Error fetching S3 keys:", error);
            alert("Failed to fetch S3 keys. Please try again.");
        }
    }

    function handleSelectKey(key: string) {
        selectedKey = key;
    }

    function handleAddDocument() {
        if (selectedKey) {
            dispatch("addDocument", selectedKey);
            resetModal();
        } else {
            alert("Please select a key from the search results!");
        }
    }

    function resetModal() {
        searchTerm = "";
        searchResults = [];
        selectedKey = null;
    }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-[90vw] sm:w-[50vw] max-w-lg relative">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-gray-800">Add Document</h2>
            <button
                class="text-gray-500 hover:text-gray-700 focus:outline-none"
                on:click={() => dispatch("close")}
            >
                ✖
            </button>
        </div>
        <div class="space-y-4">
            <div>
                <label for="searchTerm" class="block text-sm font-medium text-gray-700">
                    Search for Document Name
                </label>
                <div class="flex items-center space-x-2 mt-1">
                    <input
                        id="searchTerm"
                        type="text"
                        bind:value={searchTerm}
                        class="flex-1 px-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter search term"
                    />
                    <button
                        on:click={handleSearch}
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all"
                    >
                        Search
                    </button>
                </div>
            </div>

            {#if searchResults.length > 0}
                <div>
                    <h3 class="text-md font-semibold text-gray-800">Search Results</h3>
                    <ul class="divide-y divide-gray-200">
                        {#each searchResults as result}
                            <li
                                class="flex justify-between items-center py-3 cursor-pointer hover:bg-gray-100 transition-all"
                                on:click={() => handleSelectKey(result)}
                            >
                                <span>{result}</span>
                                {#if selectedKey === result}
                                    <span class="text-green-500 font-semibold">Selected</span>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}

            {#if selectedKey}
                <div class="mt-4">
                    <button
                        on:click={handleAddDocument}
                        class="w-full py-2 px-4 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-all"
                    >
                        Add Selected Document
                    </button>
                </div>
            {/if}

            <div class="mt-6">
                <h3 class="text-md font-semibold text-gray-800">Documents Added</h3>
                <ul class="divide-y divide-gray-200">
                    {#each documents as doc}
                        <li class="py-3">{doc}</li>
                    {/each}
                </ul>
            </div>
        </div>
    </div>
</div>
