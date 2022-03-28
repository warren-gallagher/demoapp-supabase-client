
<script lang="ts">
    import { onMount } from 'svelte';
    import { Modal, ModalHeader, ModalBody, Table, Button, ModalFooter } from 'sveltestrap/src';

    export let isOpen = false;

    let name = 'Unknown';
    let version = 'Unknown';
    let environment = 'Unknown';
    let nodeVersion = 'Unknown';

    onMount( async() => {
        const response1 = await fetch('/api/app-info', {method: 'POST'});
        if( response1.ok ) {
            const apiInfo = await response1.json();
            environment = apiInfo.environment;
            nodeVersion = apiInfo.nodeVersion;
        }
        const response2 = await fetch(`/app-info.json?time=${new Date().getTime()}`);
        if( response2.ok ) {
            const appInfo = await response2.json();
            name = appInfo.appName;
            version = appInfo.appVersion;
         }
    });

    async function dismissClicked(event) {
        isOpen = false;
    }

</script>

<Modal size="lg" toggle={() => (isOpen = !isOpen)} bind:isOpen={isOpen} class="modal-dialog-centered">
    <ModalHeader>
        <span>About</span>
    </ModalHeader>
    <ModalBody>
        <Table size="sm">
            <tbody>
                <tr>
                    <th>Application Name</th>
                    <td >{name}</td>
                </tr>
                <tr>
                    <th>Application Version</th>
                    <td>{version}</td>
                </tr>
                <tr>
                    <th>Environment</th>
                    <td>{environment} {nodeVersion}</td>
                </tr>
                 <tr>
                    <th>Copyright</th>
                    <td>Copyright &copy; Warren Gallagher 2022, all rights reserved.</td>
                </tr>
            </tbody>
        </Table>
    </ModalBody>
    <ModalFooter>
        <Button block size="sm" type="button" color="primary" on:click={dismissClicked} >
            Dismiss
        </Button>
    </ModalFooter>
</Modal>
