import { writable, type Writable } from 'svelte/store';
import { FileObject , FolderObject } from '../types/types';

export const currentPath: Writable<string> = writable("/");

// Define the Writable store for a list of FileObject or FolderObject
export const currentFileList: Writable<(FileObject | FolderObject)[]> = writable([]);