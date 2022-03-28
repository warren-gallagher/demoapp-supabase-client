<script context="module" lang="ts">
    import { loadProjects } from '$lib/models/Projects';

    /** @type {import('./index').Load} */
    export async function load({ params, fetch, session, stuff }) {
      const projects = await loadProjects();
      projects.sort(function(a, b) {return a.created_at.localeCompare(b.created_at)});
  
      return {
        status: 200,
        props: {
          projects: projects.reverse()
        }
      };
    }
  </script>

  <script lang="ts">
    import {onMount} from 'svelte';
    import { InputGroup, InputGroupText, Icon, Button, Input, Row, Col, Table, Column, Spinner } from 'sveltestrap/src';
    import type { Project } from '$lib/models/Projects';
    import CreateProject from '$lib/components/CreateProject.svelte';

    export let projects: Project[] = [];
    let filteredProjects: Project[] = projects;

    let showCreateProjectDialog = false;
    let searchTerm = "";

    $: {if(searchTerm.length >=0) { filterProjects();}}

    onMount( async() => {
    });

    function filterProjects() {
        //console.log( `filterProjects "${searchTerm}"`)
        const lowercaseSearchTerm = searchTerm.toLocaleLowerCase();
        if( lowercaseSearchTerm === "" ) {
            filteredProjects = projects;
            return;
        }
        filteredProjects = projects.filter(function(project) {
            return project.name.toLocaleLowerCase().includes(lowercaseSearchTerm);
        });
    }

    function createProjectClicked(event) {
        showCreateProjectDialog = true;
    }

    function projectCreatedEvent(event) {
        const project : Project = event.detail.project;
        projects.push(project);
        projects.sort(function(a, b) {return a.created_at.localeCompare(b.created_at)});
        projects = projects.reverse();
        filterProjects();
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

</script>

<h3>Projects</h3>
<Row>
    <Col>
        <InputGroup>
            <Input type="text" name="projectName" bind:value={searchTerm} placeholder="🔍 Search" />
            <InputGroupText><span role="button" title="clear field" on:click={() => searchTerm = ""}><Icon name="x-circle" /></span></InputGroupText>
        </InputGroup>
    </Col>
    <Col>
        <Button size="sm" class="mt-2" color="primary" on:click={createProjectClicked}>Create</Button>
    </Col>
</Row>
<Table striped rows={filteredProjects} let:row>
    <Column header="Name" width="8rem">
        <a href={`/project/${row.id}`}>{row.name}</a>
    </Column>
    <Column header="Date" width="8rem">
        {formatDate(row.created_at)} {formatTime(row.created_at)}
    </Column>
</Table>

{#if projects.length === 0}
    <div>No projects yet.</div>
{/if}

{#if showCreateProjectDialog}
    <CreateProject bind:isOpen={showCreateProjectDialog} on:project-created={projectCreatedEvent} />
{/if}