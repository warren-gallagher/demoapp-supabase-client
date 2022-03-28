<script lang="ts">
    import { onMount } from 'svelte';
    import { InputGroup, InputGroupText, Label, Icon, Button, Input, Spinner, Modal, ModalHeader, ModalBody, ModalFooter } from 'sveltestrap/src';
    import { supabaseUserClient } from '$lib/services/supabase';
    import { user } from '$lib/stores/authStore';
    
    let email;
    let rememberMe = false;
    let actionDisabled = false;
    let showSpinner = false;
    let emailSent = false;
    let errorString = "";
    let userDump;
    let loading = true;
    onMount(() => {
        load();
        setTimeout( function() {
            const element = document.getElementById('email');
            if( element ) {
                element.focus();
            }
         }, 100);
    });


   function load() {
        console.log(`Auth.load() checking for remember me...`)
        const v = localStorage.getItem('demoapp-remember-me');
        if( v && v === 'true' ) {
            rememberMe = true;
            console.log(`Auth.load() checking for email...`)
            const e = localStorage.getItem('demoapp-email');
            if( e ) {
                email = e;
            }
        }
        loading = false;
    }

    async function signInClicked(event) {
        const emailAddress = email.trim().toLowerCase();
        if( emailAddress == "" ) {
            errorString = "* required field";
            return;
        }
        localStorage.setItem('demoapp-remember-me', rememberMe.toString());
        if( rememberMe ) {
            localStorage.setItem('demoapp-email', email);
        }
        localStorage.removeItem('demoapp-auth-token');
        showSpinner = true;
        actionDisabled = true;
        const {user, session, error} = await supabaseUserClient.auth.signIn({ email: emailAddress },{scopes: ""});
        actionDisabled = false;
        showSpinner = false;
        if( error ) {
            errorString = error.message;
            return;
        }
        if( user ) {
            userDump = user;
        }
        errorString = "";
        emailSent = true;
    }

</script>

<style>
    .text-sm {
        font-size: small;
    }
</style>
    {#if loading}
        <span class="text-center"><Spinner color="danger" type="border" /></span>
    {:else}
        <Modal isOpen={true} class="modal-dialog-centered">
            <ModalHeader>
                <span>DemoApp - Sign In</span>
            </ModalHeader>
            <ModalBody>
                <Label for="email">Email</Label>
                <InputGroup>
                    <Input id="email" type="email" name="email" bind:value={email} required placeholder="Email" />
                    <InputGroupText><span role="button" title="clear field" on:click={() => email = ""}><Icon name="x-circle" /></span></InputGroupText>
                </InputGroup>
                    {#if errorString != ""}
                        <div class="text-danger pb-2">{errorString}</div>
                    {/if}
                    <Input class="pt-2" type="checkbox" bind:checked={rememberMe} label="Remember Me" />
                    {#if emailSent}
                        <div class="text-success text-center pt-2">Magic link emailed to {email}.</div>
                        <div class="text-center text-sm font-weight-light text-muted pt-2"><small>Check SPAM if email not received.</small></div>
                    {/if}
            </ModalBody>
            <ModalFooter>
                <Button class="mt-2" block type="submit" color="primary" disabled={actionDisabled} on:click={signInClicked}>
                        {#if showSpinner}
                        <Spinner size="sm" color="light" type="border" />
                        {/if}
                        Send Magic Link
                </Button>
                {#if userDump}
                    <pre>{JSON.stringify(userDump,null,2)}</pre>
                {/if}
            </ModalFooter>
        </Modal>
    {/if}
