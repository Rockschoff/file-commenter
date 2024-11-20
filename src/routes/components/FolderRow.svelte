<script lang="ts">
    import { FolderObject } from "../../types/types";
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
    import { faFolderOpen, faTrashAlt, faCommentAlt } from "@fortawesome/free-solid-svg-icons";
    import { currentPath } from "../../stores/stores";
    import { loadCurrentFileList } from "$lib/backend";
    import CommentModal from "./CommentModal.svelte";

    export let folderObject: FolderObject;

    let isModalOpen = false;
    let currentComment = folderObject.comment;

    const handleComment = () => {
        currentComment = folderObject.comment;
        isModalOpen = true;
    };

    const saveComment = async (event: CustomEvent<string>) => {
        const newComment = event.detail;
        await folderObject.updateComment(newComment);
        isModalOpen = false;
        alert("Comment updated successfully!");
    };

    const closeModal = () => {
        isModalOpen = false;
    };

    const getBaseFolderName = (s3Key: string): string => {
        return s3Key.split('/').pop() || s3Key;
    };

    const handleOpen = async () => {
        currentPath.set(folderObject.S3Key);
        loadCurrentFileList();
    };

    const handleDelete = async () => {
        const confirmation = window.confirm("Are you sure you want to delete this folder?");
        if (confirmation) {
            await folderObject.deleteFolder();
        }
    };
</script>

<div 
    class="w-full bg-gray-200 shadow-md rounded-lg flex items-center justify-between p-4 mb-4 hover:shadow-lg transition-shadow cursor-pointer"
    on:click={handleOpen}>
    <div class="flex items-center space-x-4">
        <FontAwesomeIcon icon={faFolderOpen} class="text-yellow-500" size="lg" />
        <div class="text-gray-800 font-semibold text-lg">
            {getBaseFolderName(folderObject.S3Key)}
        </div>
    </div>
    <div class="flex space-x-4">
        <button
            class="text-yellow-500 hover:text-yellow-700 focus:outline-none"
            title="Comment"
            on:click={(event) => { event.stopPropagation(); handleComment(); }}
        >
            <FontAwesomeIcon icon={faCommentAlt} size="lg" />
        </button>
        <button
            class="text-red-500 hover:text-red-700 focus:outline-none"
            title="Delete Folder"
            on:click={(event) => { event.stopPropagation(); handleDelete(); }}
        >
            <FontAwesomeIcon icon={faTrashAlt} size="lg" />
        </button>
    </div>
</div>

<CommentModal
    bind:isOpen={isModalOpen}
    {currentComment}
    on:save={saveComment}
    on:close={closeModal}
/>
