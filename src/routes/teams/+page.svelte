<script lang="ts">
	import { onMount } from "svelte";
    import {TeamObject} from "../../types/teams_types"
    import {currentTeamList} from "../../stores/stores"
    import {loadCurrentTeamList} from "$lib/backend"

    import TeamModal from "./components/TeamModal.svelte"

    let showModal : boolean  = false;
    let currentTeam : TeamObject|null = null;

    onMount(()=>{
        loadCurrentTeamList()
    })

    function openModal(team : TeamObject){
        currentTeam = team
        showModal = true
    }

    function closeModal(){
        showModal = false
        currentTeam = null
    }
</script>
<div class="w-full h-[20vh] flex justify-center items-center bg-red-300">
    <button class="bg-blue-600 h-[10vh] w-[50vw] text-white py-2 px-4 rounded-lg hover:bg-blue-700">
		Create A New Team
	</button>
</div>

<div class="w-[80vw]  flex flex-col items-center justify-center">
    <div class="flex w-full justify-around bg-gray-300">
        <p class="">Name</p>
        <p class="">Options</p>
    </div>
    {#each $currentTeamList as team}
        <div class="flex w-full justify-around bg-gray-300">
            <p class="">team.name</p>
            <button class="bg-blue-600 hover:to-blue-700 rounded-lg text-white h-10 , w-20"
            on:click={()=>{openModal(team)}}>Options</button>
        </div>
    {/each}
</div>

{#if showModal && currentTeam}
    <TeamModal team={currentTeam} on:close={closeModal}/>
{/if}



