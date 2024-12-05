<script lang="ts">
    import { TeamObject, MemberObject } from "../../../types/teams_types";
    import { createEventDispatcher } from "svelte";
    import AddMemberModal from "./AddMemberModal.svelte";
    import AddDocumentModal from "./AddDocumentModal.svelte";
    import ConfirmationModal from "./ConfirmationModal.svelte";

    const dispatch = createEventDispatcher();

    export let team: TeamObject;

    let showAddMemberModal = false;
    let showAddDocumentModal = false;
    let showConfirmationModal = false;
    let confirmationMessage = "";
    let actionToConfirm: (() => void) | null = null;

    function addMemberToTeam(member: MemberObject) {
        team.addMember(member);
        team = team; // Force re-render
    }

    function addDocumentToTeam(documentName: string) {
        team.addDocument(documentName);
        team = team; // Force re-render
    }

    function confirmRemoval(message: string, action: () => void) {
        confirmationMessage = message;
        actionToConfirm = action;
        showConfirmationModal = true;
    }

    function removeMember(member: MemberObject) {
        confirmRemoval(`Are you sure you want to remove the member "${member.name}"?`, () => {
            team.removeMember(member);
            team = team; // Force re-render
        });
    }

    function removeDocument(document: string) {
        confirmRemoval(`Are you sure you want to remove the document "${document}"?`, () => {
            team.removeDocuments(document);
            team = team; // Force re-render
        });
    }

    function handleConfirmation() {
        if (actionToConfirm) actionToConfirm();
        showConfirmationModal = false;
    }

    function cancelConfirmation() {
        showConfirmationModal = false;
    }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-[90vw] sm:w-[70vw] h-[80vh] overflow-y-auto relative">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">Edit Team</h2>
            <button
                class="text-gray-500 hover:text-gray-700 focus:outline-none"
                on:click={() => dispatch("close")}
            >
                ✖
            </button>
        </div>
        <div class="space-y-6">
            <!-- Team Name -->
            <div>
                <label for="teamName" class="block text-sm font-medium text-gray-700">Team Name</label>
                <input
                    id="teamName"
                    type="text"
                    bind:value={team.name}
                    class="mt-1 block w-full px-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <!-- Team Members -->
            <div>
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-md font-semibold text-gray-800">Team Members</h3>
                    <button
                        on:click={() => (showAddMemberModal = true)}
                        class="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-all"
                    >
                        Add Member
                    </button>
                </div>
                <ul class="divide-y divide-gray-200">
                    {#each team.members as member (member._id)}
                        <li class="flex justify-between items-center py-3">
                            <input
                                type="text"
                                bind:value={member.name}
                                class="flex-1 mr-2 px-2 py-1 border rounded text-gray-700 focus:ring-blue-500"
                            />
                            <input
                                type="email"
                                bind:value={member.email}
                                class="flex-1 mx-2 px-2 py-1 border rounded text-gray-700 focus:ring-blue-500"
                            />
                            <button
                                class="text-red-500 hover:text-red-600"
                                on:click={() => removeMember(member)}
                            >
                                Remove
                            </button>
                        </li>
                    {/each}
                </ul>
            </div>

            <!-- Team Documents -->
            <div>
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-md font-semibold text-gray-800">Team Documents</h3>
                    <button
                        on:click={() => (showAddDocumentModal = true)}
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all"
                    >
                        Add Document
                    </button>
                </div>
                <ul class="divide-y divide-gray-200">
                    {#each team.documents as document}
                        <li class="flex justify-between items-center py-3">
                            <span>{document}</span>
                            <button
                                class="text-red-500 hover:text-red-600"
                                on:click={() => removeDocument(document)}
                            >
                                Remove
                            </button>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>

        <!-- Modals -->
        {#if showAddMemberModal}
            <AddMemberModal
                on:addMember={e => addMemberToTeam(e.detail)}
                on:close={() => (showAddMemberModal = false)}
            />
        {/if}
        {#if showAddDocumentModal}
            <AddDocumentModal
                documents={team.documents}
                on:addDocument={e => addDocumentToTeam(e.detail)}
                on:close={() => (showAddDocumentModal = false)}
            />
        {/if}
        {#if showConfirmationModal}
            <ConfirmationModal
                message={confirmationMessage}
                on:confirm={handleConfirmation}
                on:cancel={cancelConfirmation}
            />
        {/if}
    </div>
</div>
