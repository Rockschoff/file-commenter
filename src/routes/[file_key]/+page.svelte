<script lang="ts">
    import { onMount } from 'svelte';

    export let data: any; // Received from the load function
    let file_key = null
    let pdfUrl: string | null = null;
    let errorMessage: string | null = null;

    onMount(async () => {
        file_key=data.file_key
        console.log('file_key' , file_key)
        try {
            if (!file_key || typeof file_key !== 'string') {
                console.log(file_key)
                throw new Error('Invalid file key');
            }

            // Properly encode file_key for the URL
            const formData = new FormData()
            formData.append("file_key" , file_key)
            // Fetch the file from the API
            const response = await fetch(`/api/get-file` , {
                method : "POST",
                body : formData
            });

            if (!response.ok) {
                const { error: err } = await response.json();
                errorMessage = err || 'Error fetching file';
                return;
            }

            // Create an object URL for the PDF
            pdfUrl = URL.createObjectURL(await response.blob());
        } catch (err) {
            console.error('Error loading PDF:', err);
            errorMessage = 'An unexpected error occurred.';
        }
    });
</script>

{#if errorMessage}
    <div class="error">
        <h1>Error</h1>
        <p>{errorMessage}</p>
    </div>
{:else if pdfUrl}
    pdf is there
    <!-- <iframe src={pdfUrl} style="width: 100%; height: 100vh;" frameborder="0"></iframe> -->
{:else}
    <div>Loading...</div>
{/if}

<style>
    .error {
        text-align: center;
        color: red;
        margin-top: 20px;
    }
</style>
