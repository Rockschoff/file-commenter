<script lang="ts">
    import { faEye, faSyncAlt, faCommentAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
    import CommentModal from "./CommentModal.svelte";
    import { FileObject } from "../../types/types";

    export let fileObject: FileObject;

    let isModalOpen = false;
    let currentComment = fileObject.comment;

    const handleComment = () => {
        currentComment = fileObject.comment;
        isModalOpen = true;
    };

    const saveComment = async (event: CustomEvent<string>) => {
        const newComment = event.detail;
        await fileObject.updateComment(newComment);
        isModalOpen = false;
        alert("Comment updated successfully!");
    };

    const closeModal = () => {
        isModalOpen = false;
    };

    const getBaseFilename = (s3Key: string): string => {
        return s3Key.split('/').pop() || s3Key;
    };

    const handleDelete = async () => {
        const confirmation = window.confirm("Are you sure you want to delete this folder?");
        if (confirmation) {
            await fileObject.deleteFile();
        }
    };

    const handleView = () => {
        const baseUrl = "/";
        const fileKey = encodeURIComponent(fileObject.S3Key);
        const viewUrl = `${baseUrl}${fileKey}`;
        window.open(viewUrl, "_blank");
    };

    const handleCheckStatus = async () => {
        await fileObject.checkStatus()
        status = fileObject.status
    };

    let status = fileObject.status
</script>

<div class="w-full bg-white shadow-md rounded-lg flex items-center justify-between p-4 mb-4 hover:shadow-lg transition-shadow">
    <div class="flex items-center space-x-4">
        <div class="text-gray-800 font-semibold text-lg flex">
            {getBaseFilename(fileObject.S3Key)} {status ? "" : "(Processing...)"}
        </div>
    </div>
    <div class="flex space-x-4">
        <button class="text-blue-500 hover:text-blue-700 focus:outline-none" title="View" on:click={handleView}>
            <FontAwesomeIcon icon={faEye} size="lg" />
        </button>
        <button class="text-green-500 hover:text-green-700 focus:outline-none" title="Check Status" on:click={handleCheckStatus}>
            <FontAwesomeIcon icon={faSyncAlt} size="lg" />
        </button>
        <button class="text-yellow-500 hover:text-yellow-700 focus:outline-none" title="Comment" on:click={handleComment}>
            <FontAwesomeIcon icon={faCommentAlt} size="lg" />
        </button>
        <button class="text-red-500 hover:text-red-700 focus:outline-none" title="Delete" on:click={handleDelete}>
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
