<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { MemberObject } from "../../../types/teams_types";

    const dispatch = createEventDispatcher();

    let newMemberName: string = "";
    let newMemberEmail: string = "";

    function handleAddMember() {
        if (newMemberName.trim() && newMemberEmail.trim()) {
            dispatch("addMember", new MemberObject(Date.now().toString(), newMemberName, newMemberEmail));
            newMemberName = "";
            newMemberEmail = "";
            dispatch("close");
        } else {
            alert("Please provide valid member details!");
        }
    }

</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-[90vw] sm:w-[50vw] max-w-lg relative">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-gray-800">Add New Member</h2>
            <button
                class="text-gray-500 hover:text-gray-700 focus:outline-none"
                on:click={() => dispatch("close")}
            >
                ✖
            </button>
        </div>
        <div class="space-y-4">
            <div>
                <label for="memberName" class="block text-sm font-medium text-gray-700">Name</label>
                <input
                    id="memberName"
                    type="text"
                    bind:value={newMemberName}
                    class="mt-1 block w-full px-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter member's name"
                />
            </div>
            <div>
                <label for="memberEmail" class="block text-sm font-medium text-gray-700">Email</label>
                <input
                    id="memberEmail"
                    type="email"
                    bind:value={newMemberEmail}
                    class="mt-1 block w-full px-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter member's email"
                />
            </div>
            <button
                on:click={handleAddMember}
                class="w-full py-2 px-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all"
            >
                Add Member
            </button>
        </div>
    </div>
</div>
