<script lang='ts'>
    import FileRow from "./FileRow.svelte"
    import FolderRow from "./FolderRow.svelte";
    import PathNavigator from "./PathNavigator.svelte";
    import { currentPath, currentFileList } from "../../stores/stores";
    import { FileObject , FolderObject } from "../../types/types";
	import { onMount } from "svelte";
    import {loadCurrentFileList} from "$lib/backend"

    


    onMount(()=>{
        loadCurrentFileList()
    })

    function openFolder(folder: FolderObject) {
        currentPath.set(folder.S3Key);
        loadCurrentFileList();
    }
    

</script>

<div class="h-full w-full flex justify-center items-center">

    <div class="w-[80vw] flex flex-col">
        <PathNavigator />
        {#each $currentFileList as object}
            {#if   object instanceof FileObject}
                <FileRow fileObject = {object} />
            {:else if  object instanceof FolderObject}
                <FolderRow folderObject = {object} />
            {:else}
                <p>Error: Unknown object type</p>
            {/if}
        {/each}
    </div>

    
    


    
</div>