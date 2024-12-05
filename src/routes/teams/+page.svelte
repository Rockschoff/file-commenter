<script lang="ts">
    import { onMount } from "svelte";
    import { TeamObject } from "../../types/teams_types";
    import { currentTeamList } from "../../stores/stores";
    import { loadCurrentTeamList } from "$lib/backend";

    import TeamModal from "./components/TeamModal.svelte";

    let showModal: boolean = false;
    let currentTeam: TeamObject | null = null;

    onMount(() => {
        loadCurrentTeamList();
    });

    function openModal(team: TeamObject) {
        currentTeam = team;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        currentTeam = null;
    }
</script>

<div class="min-h-screen bg-gray-100 flex flex-col items-center py-8">
    <!-- Header Section -->
    <div class="w-full flex justify-center items-center  h-20">
        <button
            class="bg-white text-blue-600 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-gray-200 transition-all"
            on:click={() => openModal({ name: "New Team", members: [], documents: [] })}
        >
            Create A New Team
        </button>
    </div>

    <!-- Team List Section -->
    <div class="w-full max-w-5xl mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="bg-gray-800 text-white text-lg font-semibold py-3 px-6 flex justify-between">
            <span>Name</span>
            <span>Options</span>
        </div>
        <div class="divide-y divide-gray-200">
            {#each $currentTeamList as team}
                <div class="flex justify-between items-center py-4 px-6 hover:bg-gray-100 transition-all">
                    <span class="text-gray-800 font-medium">{team.name}</span>
                    <button
                        class="bg-blue-600 text-white py-1 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-all"
                        on:click={() => openModal(team)}
                    >
                        Options
                    </button>
                </div>
            {/each}
        </div>
    </div>

    <!-- Modal Section -->
    {#if showModal && currentTeam}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <TeamModal team={currentTeam} on:close={closeModal} />
        </div>
    {/if}
</div>
