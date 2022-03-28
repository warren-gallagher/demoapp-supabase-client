
  <script lang="ts">
    import {onMount, createEventDispatcher} from 'svelte';
    import { Modal, ModalHeader, ModalBody, ModalFooter, Icon, InputGroup, InputGroupText, Button, Label, Input, Spinner } from 'sveltestrap/src';
    import { type Project, updateProject } from '$lib/models/Projects';
    
    const dispatch = createEventDispatcher();

    export let isOpen = false;
    export let project;
    let updateDisabled = false;
    let showSpinner = false;
    let projectName = project.name;
    let errorString = "";

    onMount(() => {
        setTimeout( function() {
            const element = document.getElementById('projectName');
            if( element ) {
                element.focus();
            }
         }, 100);
    });

    async function updateClicked(event) {
        if( projectName.trim().length === 0 ) {
            errorString = '* required field';
            return;
        }
        showSpinner = true;
        updateDisabled = true;
        try {
            const updatedProject = await updateProject(projectName.trim(), project.id);
            isOpen = false;
            dispatch( 'project-updated', {project: updatedProject});
        }
        catch (error) {
            errorString = error.message;
        }
        finally {
            showSpinner = false;
            updateDisabled = false;
        }

    }

    async function cancelClicked(event) {
        isOpen = false;
    }
    function keyup(event) {
        if( event.key === 'Enter' ) {
            updateClicked(event);
        }
    }

</script>

<Modal toggle={() => (isOpen = !isOpen)} bind:isOpen={isOpen} class="modal-dialog-centered">
    <ModalHeader>
        <span>Edit Project</span>
    </ModalHeader>
    <ModalBody>
        <Label for="projectName">Project Name</Label>
        <InputGroup>
            <Input type="text" id="projectName" bind:value={projectName} required placeholder="Project Name" on:keyup={keyup} />
            <InputGroupText><span role="button" title="clear field" on:click={() => projectName = ""}><Icon name="x-circle" /></span></InputGroupText>
        </InputGroup>
        {#if errorString != ""}
            <div class="text-danger pb-2">{errorString}</div>
        {/if}
    </ModalBody>
    <ModalFooter>
        <Button size="sm" type="button" color="primary" on:click={updateClicked} disabled={updateDisabled} >
            {#if showSpinner}
            <Spinner size="sm" color="light" type="border" />
            {/if}
            Update
        </Button>
        <Button size="sm" type="button" on:click={cancelClicked}>Cancel</Button>
    </ModalFooter>
</Modal>
