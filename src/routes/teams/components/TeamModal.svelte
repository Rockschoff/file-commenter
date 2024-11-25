<script lang="ts">
	import { TeamObject , MemberObject } from "../../../types/teams_types";
    import {createEventDispatcher} from "svelte"

    const dispatch = createEventDispatcher()



    export let team : TeamObject;

</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
	<div class="bg-white rounded-lg shadow-lg p-6 w-[80vw] h-[80vh] ">
		<!-- Modal Content -->
		<h2>Edit Team</h2>
        <button class="" on:click={()=>{dispatch("close")}}>x</button>
        
        <div>Name</div>
        <input type="text" value={team.name}/>

        <div class="flex flex-col justify-center items-center">
            <div class="w-[80%] flex justify-evenly">
                <p class="">Name</p>
                <p class="">Email</p>
                <p class="">Options</p>
            </div>
            {#each team.members as member}
                <div class="w-[80%] flex justify-evenly">
                    <input type="text" value={member.name}/>
                    <input type="text" value={member.email}/>
                    <button>Update</button>
                </div>
            {/each}
        </div>




	</div>
</div>
