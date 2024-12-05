import { currentFileList , currentPath, currentTeamList } from "../stores/stores";
import { FileObject , FolderObject } from "../types/types";
import { TeamObject } from "../types/teams_types";


function getCurrentPath(){
    let currentPathValue = ""
    currentPath.subscribe((value)=>{
        currentPathValue = value;
    })
    return currentPathValue?currentPathValue:"/"
}

export async function getFileListWithPrefix(prefix: string): Promise<(FileObject | FolderObject)[]> {
    try {
        const response = await fetch('/api/get-s3-objects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prefix })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch S3 objects');
        }

        const data = await response.json();
        // Map and resolve promises using Promise.all
        const answer = await Promise.all(
            data.map(async (item: any) => {
                
                if(item.S3Key.split("/").pop()!=="__comment__.txt"){
                    if (item.S3Key.endsWith('/')) {
                        return new FolderObject(item.S3Key, item.comment);
                    } else {
                        const fileObject = new FileObject(item.S3Key, item.status, item.comment);
                        console.log("checking status")
                        await fileObject.checkStatus();
                        return fileObject;
                    }
                }else{
                    return null
                }
                
            })
        );

        return answer.filter((item) => item !== null); //<TASK> remove all the null in this array
    } catch (error) {
        console.error('Error in getFileListWithPrefix:', error);
        return [];
    }
}

export async function loadCurrentFileList(){
    const currentPathValue = getCurrentPath()
    const fileList = await getFileListWithPrefix(currentPathValue)
    currentFileList.set(fileList)
}

export async function loadCurrentTeamList(){

        currentTeamList.set([
            new TeamObject("1364748" , "Team A" , [] , []),
            new TeamObject("cnjfhs98" , "Team B" , [] , []),
            new TeamObject("cnjfhsojeier98" , "Team C" , [] , [])
        ])
    
    
}

export async function getMatchingS3Keys(name : string):Promise<string[]>{
    //exmaple implementation for refernece real implementation coming soon.

    //this function returns alist of matching s3 keys after searching an s3 bucket
    return ["ABC" , "DEF/EFG"]
}