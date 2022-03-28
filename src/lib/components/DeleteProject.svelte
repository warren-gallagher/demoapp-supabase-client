
  <script lang="ts">
    import {onMount, createEventDispatcher} from 'svelte';
    import { Modal, ModalHeader, ModalBody, DropdownItem, InputGroup, InputGroupText, Button, Input, Spinner, ModalFooter } from 'sveltestrap/src';
    import { type Project, softDeleteProject } from '$lib/models/Projects';
    
    const dispatch = createEventDispatcher();

    export let isOpen = false;
    export let project;
    let deleteDisabled = false;
    let showSpinner = false;

    onMount( async() => {
    });

    async function deleteClicked(event) {
        showSpinner = true;
        deleteDisabled = true;
        try {
            const deletedProject = await softDeleteProject(project.id);
            isOpen = false;
            dispatch('project-deleted', {project: project});
        }
        catch (error) {
        }
        finally {
            showSpinner = false;
            deleteDisabled = false;
        }

    }

    async function cancelClicked(event) {
        isOpen = false;
    }

</script>

<Modal toggle={() => (isOpen = !isOpen)} bind:isOpen={isOpen} class="modal-dialog-centered">
    <ModalHeader>
        <span>Delete Project: {project.name}</span>
    </ModalHeader>
    <ModalBody>
            <div class="pb-2">Are you sure you want to delete this project?</div>
    </ModalBody>
    <ModalFooter>
        <Button size="sm" type="submit" color="danger" disabled={deleteDisabled} on:click={deleteClicked} >
            {#if showSpinner}
            <Spinner size="sm" color="light" type="border" />
            {/if}
            Delete
        </Button>
        <Button size="sm" type="button" on:click={cancelClicked}>Cancel</Button>
    </ModalFooter>
</Modal>
