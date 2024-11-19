import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
    console.log(params)
    return { file_key: params.file_key };
};
