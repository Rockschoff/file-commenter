import {loadCurrentFileList} from "../lib/backend"


export class FileObject {
    readonly S3Key: string; // Assigned during initialization
    private _status: boolean; // Read-only via a getter
    private _comment: string;
    private _preSignedURL : string = "";
    
  
    constructor(S3Key: string, status: boolean, comment: string) {
        this.S3Key = S3Key;
        this._status = status
        this._comment = comment;
        
    }
  
    // Getter for status (read-only)
    get status(): boolean {
        return this._status;
    }
  
    // Getter and Setter for comment
    get comment(): string {
        return this._comment;
    }

    get preSignedURL() : string {
        return this._preSignedURL
    }
  
    set comment(newComment: string) {
        this._comment = newComment;
    }
  
    // Async methods
    async downloadFile(): Promise<void> {
        // Add logic to download the file
    }

    async getObjectURL() : Promise<void>{

        const url = "/api/get-pre-signed-url"
        const requestData = {
            key : this.S3Key
        }
        let ans : string = ""

        try{
            const response = await fetch(url , {
                method:"POST",
                headers:{
                    'Content-type' : "application/json"
                },
                body : JSON.stringify(requestData)

            })
            if(response.ok){
                const data = await response.json()
                if(data.url){
                    ans = data.url
                }

            }
        }catch(err){
            console.error("Error while getting the pre signed url")
        }

        this._preSignedURL = ans;
        
    }
  
    async checkStatus(): Promise<void> {
        // Add logic to check file status
        const url = "/api/get-file-status"
        const requestData = {
            key: this.S3Key,
        };

        try{
            const response = await fetch(url , {
                method : "POST",
                headers:{
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(requestData),
            })
            if(response.ok){
                const data  = await response.json()
                if (typeof data.exists === "boolean") {
                    this._status = data.exists
                } else {
                    console.error("Unexpected response format:", data);
                    this._status = false; // Fallback if the format isn't as expected
                }
            }else{
                console.error("Failed to fetch file status. HTTP status:", response);
                console.log(response.statusText)
                this._status = false;
            }
        }catch(err){
            console.error("error check file status " , err)
            this._status=false
        }

        await this.getObjectURL()
    }
  
    async loadFileToShow(): Promise<void> {
        // Add logic to load the file for viewing
    }
  
    async updateComment(newComment: string): Promise<void> {
        if(this._comment==newComment){
            return
        }
        

        const url = "/api/comment-on-file"
        const body = {
            "comment" : newComment,
            "key" : this.S3Key
        }
        try{
            const response = await fetch(url , {
                method:"POST",
                headers:{
                    'Content-type': 'application/json'
                },
                body : JSON.stringify(body)
            })
            if(response.ok){
                console.log("comment has been added to the file")
                this._comment = newComment;
            }
        }catch(err){
            console.error("Error occurred while making the comment on the file : ", err)
        }
        // Add logic to update the comment
    }
  
    async replaceFile(newFile: File): Promise<void> {
        // Add logic to replace the file
    }
  
    async deleteFile(): Promise<void> {
        // Add logic to delete the file
        const url = "/api/delete"
        try{
            const response = await fetch(url , {
                method : "POST",
                headers:{
                    'Content-type': 'application/json'
                },
                body : JSON.stringify({"keys" : [this.S3Key]})
            })

            if(response.ok){
                console.log(response.status)
                loadCurrentFileList()
            }
        }catch(err){
            console.error("Error occured while calling the api" , err)
        }

    }
}

export class FolderObject {
    readonly S3Key: string; // Assigned during initialization
    private _comment: string;
    
  
    constructor(S3Key: string, comment: string) {
        this.S3Key = S3Key;
        this._comment = comment;
    }
  
    // Getter and Setter for comment
    get comment(): string {
        return this._comment;
    }
  
    set comment(newComment: string) {
        this._comment = newComment;
    }
  
    // Async methods
    async loadingContents(storeObject: any): Promise<void> {
        // Add logic to load folder contents
    }
  
    async updateComment(newComment: string): Promise<void> {
        if(newComment == this._comment){
            return
        }
        const url = "/api/comment-on-folder"
        const requestData = {
            key: this.S3Key,
            comment: newComment,
        };

        try{

            const response = await fetch(url , {
                method : "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData), // Send JSON payload
            })
            if(response.ok){
                console.log("Successfully updated the comments on folder : " , this.S3Key)
                this._comment=newComment
            }

        }catch(err){
            console.error("Error updateing comments on the folder : " , this.S3Key)
        }
        // Add logic to update the folder's comment
    }
  
    async downloadEntireFolder(): Promise<void> {
        // Add logic to download the entire folder
    }
  
    async replaceFolder(newFolder: any): Promise<void> {
        // Add logic to replace the folder
    }
  
    async deleteFolder(): Promise<void> {
        const get_files_url = "/api/get-all-files-with-prefix";
        const delete_url = "/api/delete";
        const prefix = this.S3Key;
    
        try {
            // Fetch all files with the given prefix
            const response = await fetch(get_files_url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prefix }), // Send prefix as JSON
            });
    
            if (response.ok) {
                const data = await response.json();
    
                if (data.keys && Array.isArray(data.keys)) {
                    // Prepare the list of filenames for deletion
                    const keys = data.keys;
    
                    try {
                        // Delete the files using the delete API
                        const deleteResponse = await fetch(delete_url, {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ keys }), // Send filenames as JSON
                        });
    
                        if (deleteResponse.ok) {
                            console.log("Successfully deleted files:", deleteResponse.status);
                            // Optionally reload the file list if a function like loadCurrentFileList exists
                            loadCurrentFileList();
                        } else {
                            console.error("Failed to delete files:", deleteResponse.statusText);
                        }
                    } catch (err) {
                        console.error("Error deleting files for the folder:", err);
                    }
                } else {
                    console.error("Unexpected response format:", data);
                }
            } else {
                console.error("Failed to fetch file list:", response.statusText);
            }
        } catch (err) {
            console.error("Error fetching files to delete:", err);
        }
    }
    
}
