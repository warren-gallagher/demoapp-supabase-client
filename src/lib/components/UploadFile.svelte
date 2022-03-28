<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { user } from '$lib/stores/authStore';
    import { supabaseUrl, supabaseUserClient } from '$lib/services/supabase';
    import { Icon, Progress, Row, Col, } from 'sveltestrap';

    export let browserFileObject;
    export let projectId;
    export let bucket = 'drawing';

    let xhr;
    let fileName = browserFileObject.name;
    let uploadingPercentageDone = 0;
    enum UploadState {
        Uploading,
        Failed,
        Succeeded
    };
    let uploadState = UploadState.Uploading;
    let errorMessage = "";

    const dispatch = createEventDispatcher();

    onMount(() => {
        upload();
    });

    async function delay(ms) {
        return new Promise(function(resolve, reject) {
            setTimeout(resolve, ms);
        });
    }

    function updateProgress(e) {
        uploadingPercentageDone = Math.floor((e.loaded / e.total) * 100);
    }

    async function transferComplete(e) {
        console.log( `UploadFile.transferError ${JSON.stringify(e)}`);
    }    
    
    async function transferError(e) {
        console.log( `UploadFile.transferError ${JSON.stringify(e)}`);
    }

    async function transferAbort(e) {
        console.log( `UploadFile.transferAbort ${JSON.stringify(e)}`);
    }

    async function transferTimeout(e) {
        console.log( `UploadFile.transferTimeout ${JSON.stringify(e)}`);
    }

    async function transferReadyStateChange(e) {
        console.log( `transferReadyState readyState=${xhr.readyState} status=${xhr.status} responseText=${xhr.responseText}`)
        if( xhr.readyState == XMLHttpRequest.DONE && xhr.status == 0 ) {
            uploadState = UploadState.Failed;
            errorMessage = "Aborted";
            return;
        }
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        
        
        let xhrResponse = JSON.parse(xhr.responseText);
        if( xhr.status === 200 || xhr.status === 201 ) {
            uploadingPercentageDone = 100;
            await delay(200);
            let uploadResponse = null;
            const path = `${$user.id}/project/${projectId}/`;
            const {data, error} = await supabaseUserClient.storage.from(bucket).list(path);
            if( !error ) {
                const files = data;
                uploadResponse = files.find(function(file) {return file.name == fileName});
            }
            uploadState = UploadState.Succeeded;
            dispatch( 'upload-succeeded', {
                browserFileObject: browserFileObject, 
                bucket: bucket, projectId: 
                projectId, 
                uploadResponse: uploadResponse});
        }
        else {
            uploadState = UploadState.Failed;
            errorMessage = xhrResponse.message;
            if( xhrResponse.statusCode == "23505" ) {
                errorMessage = "Duplicate File";
            }
            dispatch('upload-failed', {
                browserFileObject: browserFileObject, 
                bucket: bucket, 
                projectId: projectId, 
                message: errorMessage
            });

        }
    }
                
    async function upload() {
        // check to see if the upload already exists
        const path = `${$user.id}/project/${projectId}/`;
        const {data, error} = await supabaseUserClient.storage.from(bucket).list(path);
        if( !error ) {
            const files = data;
            const fileNames = files.map(function(file) {return file.name.toLocaleLowerCase();});
            if( fileNames.includes(fileName.toLocaleLowerCase()) ) {
                errorMessage = 'Duplicate File';
                uploadState = UploadState.Failed;
                dispatch('upload-failed', {
                    browserFileObject: browserFileObject, 
                    bucket: bucket, 
                    projectId: projectId, 
                    message: errorMessage});
                return;
            }
        }
        const url =`${supabaseUrl}storage/v1/object/${bucket}/${path}${fileName}`;
        xhr = new XMLHttpRequest();
        xhr.upload.onprogress = updateProgress;
        xhr.upload.onload = transferComplete;
        xhr.upload.onerror = transferError;
        xhr.upload.onabort = transferAbort;
        xhr.upload.ontimeout = transferTimeout;
        xhr.onreadystatechange = transferReadyStateChange;
        xhr.open("POST", url);
        xhr.setRequestHeader('Authorization', `Bearer ${supabaseUserClient.auth.session().access_token}`);
        xhr.send(browserFileObject);
    }

    async function abortUpload(event) {
        xhr.abort();
    }

    async function closeUpload(event) {
        dispatch('upload-closed', {
                    browserFileObject: browserFileObject, 
                    bucket: bucket, 
                    projectId: projectId
                });
    }
</script>
<style>
    .close {
        cursor: pointer;
    }
</style>
<Row>
    <Col>
        {#if uploadState == UploadState.Uploading}
            <span on:click={abortUpload} class="close text-danger" title="Abort"><Icon name="x-circle" /></span>
        {/if}
        {#if uploadState == UploadState.Failed}
            <span on:click={closeUpload} class="close" title="Close"><Icon name="x-circle" /></span>
        {/if}
        {#if uploadState == UploadState.Succeeded}
            <span on:click={closeUpload} class="close" title="Close"><Icon name="x-circle" /></span>
        {/if}
        <span >{fileName}</span>
        <hr/>
    </Col>

    <Col>
        <Col>
            {#if uploadState == UploadState.Failed}
                <div class="text-left text-danger">{errorMessage}</div>
            {:else}
                <Progress bind:value={uploadingPercentageDone} color="primary"></Progress>
            {/if}
        </Col>
        <Col>
        </Col>
        <hr/>
    </Col>

    <Col>
    </Col>

    <Col>
    </Col>

</Row>
