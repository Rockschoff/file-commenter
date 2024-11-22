import { currentFileList , currentPath } from "../stores/stores";
import { FileObject , FolderObject } from "../types/types";

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
                if (item.S3Key.endsWith('/')) {
                    return new FolderObject(item.S3Key, item.comment);
                } else {
                    const fileObject = new FileObject(item.S3Key, item.status, item.comment);
                    console.log("checking status")
                    await fileObject.checkStatus();
                    return fileObject;
                }
            })
        );

        return answer; // Resolved array of objects // this is a array of promisses , that is not what i wnat to return <TASK>
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