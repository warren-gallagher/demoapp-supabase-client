import {supabaseUserClient} from '$lib/services/supabase';

export type Project = {
    id: number;
    created_at: string;
    name: string;
    user_id: string;
    deleted: boolean;
};

/** 
 * @throws {Error}
 */
 export async function loadProjects() : Promise<Project[]> {
    const {data, error} = await supabaseUserClient.from<Project>('projects').select().match({deleted: false});
    if( error ) {
        throw new Error(`loadProjects error - ${JSON.stringify(error,null,2)}`);
    }
    return data;
}

/** 
 * @throws {Error}
 */
 export async function loadProject(id) : Promise<Project> {
    const {data, error} = await supabaseUserClient.from<Project>('projects').select().match({id});
    if( error ) {
        throw new Error(`loadProject error - ${JSON.stringify(error,null,2)}`);
    }
    return data[0];
}

/** 
 * @throws {Error}
 */
 export async function addProject( name: string, user_id: string ) : Promise<Project>{
    const {data,error} = await supabaseUserClient.from<Project>('projects').insert([{name, user_id}]);
    if( error ) {
        throw new Error(`addProject error - ${JSON.stringify(error,null,2)}`);
    }
    return data[0];
}

/** 
 * @throws {Error}
 */
 export async function updateProject( name: string, id: number ) : Promise<Project>{
    const {data,error} = await supabaseUserClient.from<Project>('projects').update({name}).match({id});
    if( error ) {
        throw new Error(`updateProject error - ${JSON.stringify(error,null,2)}`);
    }
    return data[0];
}

/** 
 * @throws {Error}
 */
export async function softDeleteProject( id: number ) {
    const {data,error} = await supabaseUserClient.from<Project>('projects').update({deleted: true}).match({id});
    if( error ) {
        throw new Error(`deleteProject error - ${JSON.stringify(error,null,2)}`);
    }
    return data[0];
}

/** 
 * @throws {Error}
 */
export async function hardDeleteProject( id: number ) {
    const project = await loadProject(id);
    const path = `${project.user_id}/project/${id}`;
    const {data: listing} = await supabaseUserClient.storage.from('drawings').list(path)
    if( listing ) {
        console.log( `hardDeleteProject listing - ${JSON.stringify(listing,null,2)}`);
        const paths = listing.map(function(item) {return `${path}/${item.name}`});
        console.log( `hardDeleteProject paths - ${JSON.stringify(paths,null,2)}`);
        await supabaseUserClient.storage.from('drawings').remove(paths);
    }
    
    const {data,error} = await supabaseUserClient.from<Project>('projects').delete().match({id});
    if( error ) {
        throw new Error(`deleteProject error - ${JSON.stringify(error,null,2)}`);
    }
    return data[0];
}

