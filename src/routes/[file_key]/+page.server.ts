import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const file_key = params.file_key;

    if (!file_key) {
        throw new Error('File key is required');
    }

    console.log("OPEN : " , file_key)
    return { file_key };
};
