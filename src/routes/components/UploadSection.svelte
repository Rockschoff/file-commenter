<script lang="ts">
  import { loadCurrentFileList } from "$lib/backend";
  import { currentPath } from "../../stores/stores";

  type SelectedFile = {
      name: string;
      size: number;
      type: string;
      content : string|null;
  };

  let files: SelectedFile[] = [];
  let folders: SelectedFile[] = [];
  let uploadedFiles : SelectedFile[] = [];
  let uploading: boolean = false;
  let uploadMessage: string = "";

 



  async function handleFileUpload(event : Event) : Promise<void> {
        uploading = true;
        const input = event.target as HTMLInputElement;
        if (input.files){
            for (const file of Array.from(input.files)) {
                const fileContent = await readFileAsBase64(file);
                files = [...files , {
                    name: $currentPath=="/"?file.name:`${$currentPath}${file.name}`,
                    size: file.size,
                    type: file.type,
                    content: fileContent}
                ];
            }
            for (const file of files) {
                let uploadArray = [file]
                let payload = {
                    level: $currentPath === "/" ? "" : $currentPath,
                    files: uploadArray,
                };
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    console.error('File upload failed:', await response.json());
                } else {
                    console.log('File uploaded successfully:', await response.json());
                    uploadedFiles = [...uploadedFiles , file]
                    
                }
                loadCurrentFileList()
            }
        }

        uploading = false;
        files=[]
        uploadedFiles=[]
    }



// Helper function to read file as a base64 string
async function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString().split(',')[1] || '');
        reader.onerror = reject;
        reader.readAsDataURL(file); // Read file as data URL and extract base64 content
    });
}

    async function handleFolderUpload(event : Event) : Promise<void> {
        uploading = true;
        const input = event.target as HTMLInputElement;
        if (input.files){
            for (const file of Array.from(input.files)) {
                const fileContent = await readFileAsBase64(file);
                files = [...files , {
                    name: $currentPath === "/" ? file.webkitRelativePath : `${$currentPath}${file.webkitRelativePath}`,
                    size: file.size,
                    type: file.type,
                    content: fileContent}
                ];
            }
            for (const file of files) {
                let uploadArray = [file]
                let payload = {
                    level: $currentPath === "/" ? "" : $currentPath,
                    files: uploadArray,
                };
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    console.error('File upload failed:', await response.json());
                } else {
                    console.log('File uploaded successfully:', await response.json());
                    uploadedFiles = [...uploadedFiles , file]
                    
                }
                loadCurrentFileList()
            }
        }

        uploading = false;
        files=[]
        uploadedFiles=[]
    }

</script>

<div class="w-full flex justify-center items-center gap-6 mt-8 mb-8">
  <!-- File Upload -->
  <label class="flex flex-col items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md cursor-pointer hover:from-blue-600 hover:to-indigo-600 transition-colors">
      <input type="file" multiple class="hidden" on:change={handleFileUpload} />
      <span class="font-medium">Upload Files</span>
  </label>

  <!-- Folder Upload -->
  <label class="flex flex-col items-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow-md cursor-pointer hover:from-green-600 hover:to-teal-600 transition-colors">
      <input type="file" webkitdirectory class="hidden" on:change={handleFolderUpload} />
      <span class="font-medium">Upload Folders</span>
  </label>

  <!-- Upload Status -->
  {#if uploading}
      <p class="text-blue-500 mt-2 animate-pulse">{uploadMessage}</p>
  {/if}
</div>

<!-- Display Uploaded Files -->
{#if files.length > 0}
  <div class="mt-6 w-full">
    <h1>Please do not reload</h1>
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Uploaded Files:</h3>
      <ul class="divide-y divide-gray-200">
          {#each files as file}
              {#if !uploadedFiles.includes(file)}
                <li class="py-3 flex justify-between">
                    <span class="text-gray-700">{file.name}</span>
                    <span class="text-gray-500 text-sm">{(file.size / 1024).toFixed(2)} KB</span>
                </li>
              {/if}
          {/each}
      </ul>
  </div>
{/if}

<!-- Display Uploaded Folders -->
{#if folders.length > 0}
  <div class="mt-6 w-full">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Uploaded Folders:</h3>
      <ul class="divide-y divide-gray-200">
          {#each folders as folder}
              <li class="py-3 flex justify-between">
                  <span class="text-gray-700">{folder.name}</span>
                  <span class="text-gray-500 text-sm">{(folder.size / 1024).toFixed(2)} KB</span>
              </li>
          {/each}
      </ul>
  </div>
{/if}
