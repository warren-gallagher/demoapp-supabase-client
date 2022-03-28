
  <script lang="ts">
    import {onMount, createEventDispatcher} from 'svelte';
    import { Modal, ModalHeader, ModalBody, Icon, InputGroup, InputGroupText, Button, Label, Input, Spinner, ModalFooter } from 'sveltestrap/src';
    import { type Project, addProject } from '$lib/models/Projects';
    import { user } from '$lib/stores/authStore';
    
    const dispatch = createEventDispatcher();

    export let isOpen = false;
    let newDisabled = false;
    let showSpinner = false;
    let projectName = "";
    let errorString = "";

    onMount( async() => {
        setTimeout( function() {
            const element = document.getElementById('projectName');
            if( element ) {
                element.focus();
            }
         }, 100);
    });

    async function createClicked(event) {
        if( projectName.trim().length === 0 ) {
            errorString = '* required field';
            return;
        }
        showSpinner = true;
        newDisabled = true;
        try {
            const project = await addProject(projectName.trim(), $user.id);
            dispatch( 'project-created', {project: project});
            isOpen = false;
        }
        catch (error) {
            errorString = error.message;
        }
        finally {
            showSpinner = false;
            newDisabled = false;
        }

    }

    async function cancelCreateClicked(event) {
        isOpen = false;
    }

    function keyup(event) {
        if( event.key === 'Enter' ) {
            createClicked(event);
        }
    }
</script>

<Modal toggle={() => (isOpen = !isOpen)} bind:isOpen={isOpen} class="modal-dialog-centered">
    <ModalHeader>
        <span>Create Project</span>
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
        <Button size="sm" type="button" color="primary" disabled={newDisabled} on:click={createClicked}>
            {#if showSpinner}
            <Spinner size="sm" color="light" type="border" />
            {/if}
            Create
        </Button>
        <Button size="sm" type="button" on:click={cancelCreateClicked}>Cancel</Button>
    </ModalFooter>
</Modal>
