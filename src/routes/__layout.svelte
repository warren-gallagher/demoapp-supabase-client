<script lang="ts">
    import { browser } from '$app/env'; 
    import {supabaseUserClient} from '$lib/services/supabase';
    import { user } from '$lib/stores/authStore';
    import Auth from '$lib/components/Auth.svelte';
    import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, NavLink, DropdownItem, Container, Icon } from 'sveltestrap';
    import { goto } from '$app/navigation';
    import AboutDialog from '$lib/components/AboutDialog.svelte';
    import { onMount } from 'svelte';

    let menuIsOpen = false;
    let showAboutDialog = false;

    onMount(() => {
    });
    function registerForAuthStateChanges() {
        supabaseUserClient.auth.onAuthStateChange( function(event, session) {
            user.set(session?.user);
            console.log(`supabase.auth.onAuthStateChange - event=${event}`);
            if( session?.user) {
                console.log(`supabase.auth.onAuthStateChange - signed in`)
                user.set(session?.user);
                console.log(`supabase.auth.onStateChange user - ${JSON.stringify($user,null,2)}`);
                localStorage.setItem('demoapp-auth-token', session?.access_token);
                goto('/projects');
            }
            else {
                console.log(`supabase.auth.onAuthStateChange - signed out`)
                user.set(null);
                goto('/');
            }
        });
    }

    if( browser ) {
        user.set(supabaseUserClient.auth.user());
        registerForAuthStateChanges();
        setTimeout(registerForAuthStateChanges, 1000);
        console.log( `running on browser`)
        if( $user !== null ) {
            goto('/projects');
        }
    }

    function handleCollapseUpdateEvent(event) {
        menuIsOpen = event.detail.menuIsOpen;
    }

    function toggleNavbarClicked(event) {
        menuIsOpen = !menuIsOpen
    }

    function aboutClicked(event) {
        event.preventDefault();
        showAboutDialog = true;
    }
</script>

<svelte:head>
    <title>DemoApp</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css">
    <style>
        /* prevent bootstrap from drawing the blue glow around input fields when in focus */
        .form-control:focus {
            box-shadow: none; 
        }
        .input-group-text {
            background-color: white;
            border: none;
            right: 
        }

    </style>
</svelte:head>

{#if $user}
    <Navbar color="light" light expand="md">
        <NavbarBrand href="/about">DemoApp</NavbarBrand>
        <NavbarToggler on:click={toggleNavbarClicked} />
        <Collapse bind:isOpen={menuIsOpen} navbar expand="md" on:update={handleCollapseUpdateEvent}>
            <Nav class="ms-auto" navbar>
                <NavItem>
                    <NavLink active href="/projects">Projects</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink active href="/account">Account</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink active href="/about" on:click={aboutClicked}><Icon name="info-circle"/></NavLink>
                </NavItem>
            </Nav>
        </Collapse>
    </Navbar>
    <DropdownItem divider />
    <Container fluid >
        <slot>

        </slot>
    </Container>
    {#if showAboutDialog} 
        <AboutDialog bind:isOpen={showAboutDialog}/>
    {/if}
{:else}
    <Auth />
{/if}
