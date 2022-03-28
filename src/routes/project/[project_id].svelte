<script context="module" lang="ts">
    import { loadProject } from '$lib/models/Projects';

    /** @type {import('./[project_id]').Load} */
    export async function load({ params, fetch, session, stuff }) {
        const project = await loadProject(params.project_id);
        if( !project ) {
            // this can happen if the user refreshes while on this page.
            // the user session has not been reestablished yet.
            // bounce back to /projects
            return {status: 307, headers: ['Location:', '/projects']}
        }
        const path = `${project.user_id}/project/${project.id}/`;
        const {data, error} = await supabaseUserClient.storage.from('drawings').list(path);
        const drawings = data;
        drawings.sort(function(a, b) {return a.created_at.localeCompare(b.created_at)});
        return {
            status: 200,
            props: {
            project: project,
            drawings: drawings
            }
        };
    }

</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { user } from '$lib/stores/authStore';
    import { supabaseUserClient } from '$lib/services/supabase';
    import { Breadcrumb, BreadcrumbItem, Icon, Button, Row, Col, Table, Column, InputGroup, InputGroupText, Input, Toast, ToastHeader, ToastBody } from 'sveltestrap';
    import EditProject from '$lib/components/EditProject.svelte';
    import DeleteProject from '$lib/components/DeleteProject.svelte';
    import UploadFile from '$lib/components/UploadFile.svelte';
    import Dropzone from 'svelte-file-dropzone';

    export let project;
    export let drawings = [];

    let filteredDrawings = drawings;
    
    interface UploadError {
        name: string,
        message: string
    };

    let uploads = [];
    let searchTerm = "";
    let showEditProjectDialog = false;
    let showDeleteProjectDialog = false;
    let showUploadRejectedToast = false;
    let dropable = false;
    const accept = 'image/png, application/pdf';

    $: {if(searchTerm.length >=0) { filterDrawings();}}

    async function loadDrawings() {
        const path = `${$user.id}/project/${project.id}/`;
        const {data, error} = await supabaseUserClient.storage.from('drawings').list(path);
        if( !error ) {
            drawings = data;
            drawings.sort(function(a, b) {return a.created_at.localeCompare(b.created_at)});
            filteredDrawings = drawings;
        }
    }

    function filterDrawings() {
        //console.log( `filterProjects "${searchTerm}"`)
        const lowercaseSearchTerm = searchTerm.toLocaleLowerCase();
        if( lowercaseSearchTerm === "" ) {
            filteredDrawings = drawings;
            return;
        }
        filteredDrawings = drawings.filter(function(drawing) {
            return drawing.name.toLocaleLowerCase().includes(lowercaseSearchTerm);
        });
    }

    async function delay(ms) {
        return new Promise(function(resolve, reject) {
            setTimeout(resolve, ms);
        });
    }

    async function handleSelectedFiles(e) {
        const {acceptedFiles} = e.detail;
        for( const browserFileObject of acceptedFiles ) {
            uploads.push(browserFileObject);
            uploads = uploads;
        }

    }
    function formatBytes(bytes,decimals=1) {
        if(bytes == 0) {
            return '0 Bytes';
        }
        const k = 1024
        const dm = decimals || 2
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function formatDate( isoStr ) {
        if( isoStr === "" ) { return ""; }
        const d = new Date(isoStr);
        const s = d.toLocaleDateString();
        return s;
    }

    function formatTime( isoStr ) {
        if( isoStr === "" ) { return ""; }
        const d = new Date(isoStr);
        const s = d.toLocaleTimeString();
        return s;
    }

    function editProjectClicked(event) {
        showEditProjectDialog = true;
    }

    function projectUpdatedEvent(event) {
        project = event.detail.project;
    }

    function deleteProjectClicked(event) {
        showDeleteProjectDialog = true;
    }

    function projectDeletedEvent(event) {
        goto('/projects', {replaceState: true});
    }

    async function uploadSucceeded(event) {
        const {browserFileObject, uploadResponse} = event.detail;
        drawings.push(uploadResponse);
        filterDrawings();
        await delay(2000);

        const uploadIndex = uploads.findIndex(function(upload) {return upload.name === browserFileObject.name;});
        if( uploadIndex > -1) {
           uploads.splice(uploadIndex,1);
           uploads = uploads;
        }
    }
    async function uploadFailed(event) {
        const {browserFileObject} = event.detail;
    }

    async function uploadClosed(event) {
        const {browserFileObject} = event.detail;
        const uploadIndex = uploads.findIndex(function(upload) {return upload.name === browserFileObject.name;});
        if( uploadIndex > -1) {
           uploads.splice(uploadIndex,1);
           uploads = uploads;
        }
    }

    function dragEnter(event) {
        dropable=true;
    }

    function dragLeave(event) {
        dropable=false;
    }

    function dropAccepted(event) {
        dropable=false;
    }

    function dropRejected(event) {
        dropable=false;
        showUploadRejectedToast = true;;
    }
</script>
<style>
    .dropable {
        background-color: lightblue;
    }
</style>
<Dropzone on:drop={handleSelectedFiles} disableDefaultStyles={true} noClick={true} accept={accept}
    on:dragenter={dragEnter} on:dragleave={dragLeave} on:drop={dragLeave} 
    on:dropaccepted={dropAccepted} on:droprejected={dropRejected}>
    <div class:dropable={dropable}>
    <Row>
        <Col cols={3}>
            <Breadcrumb>
                <BreadcrumbItem><a href="/projects">Projects</a></BreadcrumbItem>
                <BreadcrumbItem><a href={`/project/${project.id}`}>Project: {project.name}</a></BreadcrumbItem>
            </Breadcrumb>
        </Col>
        <Col cols={1}>
            <Button size="sm" type="button" color="primary" on:click={editProjectClicked}>Edit</Button>
            <Button size="sm" type="button" color="danger" on:click={deleteProjectClicked}>Delete</Button>
        </Col>
    </Row>

    <h5 class="pt-4">Drawings</h5>
    <Row>
        <Col>
            <InputGroup>
                <Input type="text" name="projectName" bind:value={searchTerm} placeholder="🔍Search" />
                <InputGroupText><span role="button" title="clear field" on:click={() => searchTerm = ""}><Icon name="x-circle" /></span></InputGroupText>
            </InputGroup>
        </Col>
        <Col>
            <Button color="primary">
            <Dropzone on:drop={handleSelectedFiles} disableDefaultStyles={true} accept={accept}>
                Upload
            </Dropzone>
            
        </Button>
        </Col>
    </Row>

    {#if uploads.length > 0}
        <h5 class="pt-2">Uploads</h5>
        {#each uploads as upload}
            <UploadFile 
                browserFileObject={upload} 
                projectId={project.id} 
                bucket="drawings" 
                on:upload-succeeded={uploadSucceeded} 
                on:upload-failed={uploadFailed}
                on:upload-closed={uploadClosed} />
        {/each}
    {/if}
    {#if showUploadRejectedToast}
        <div class="bg-danger mt-2" style="width:350px; margin: auto;">
            <Toast autohide body header="Upload rejected - invalid file type" isOpen={showUploadRejectedToast}
            on:close={() => (showUploadRejectedToast = false)}>
                Only PNG and PDF files are allowed.
            </Toast>    
        </div>
    {/if}       
    <Table striped rows={filteredDrawings} let:row>
        <Column header="Name" width="8rem">
            {row.name}
        </Column>
        <Column header="Date" width="8rem">
            {formatDate(row.updated_at)} {formatTime(row.updated_at)}
        </Column>
        <Column header="Size" width="8rem">
            {formatBytes(row.metadata.size)}
        </Column>
    </Table>
    </div>
</Dropzone>

{#if showEditProjectDialog}
    <EditProject bind:isOpen={showEditProjectDialog} project={project} on:project-updated={projectUpdatedEvent}/>
{/if}

{#if showDeleteProjectDialog}
    <DeleteProject bind:isOpen={showDeleteProjectDialog} project={project} on:project-deleted={projectDeletedEvent} />
{/if}

