<script lang="ts">
    import { user} from '$lib/stores/authStore';
    import { supabaseUserClient } from '$lib/services/supabase';
    import { TabContent, TabPane, Container, Row, Col, Icon, Button, Popover, InputGroup, InputGroupText, Label, Input, Spinner } from 'sveltestrap';

    let subscription;

    async function signOutClicked(event) {
        event.preventDefault();
        await supabaseUserClient.auth.signOut();
        user.set(null);
        localStorage.removeItem('demoapp-auth-token');
    }

    async function getSubscription() {
        const requestOptions = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${supabaseUserClient.auth.session().access_token}`}
            
        }
        const response = await fetch('/api/subscription', requestOptions);
        if( response.ok ) {
            subscription = await response.json();
        }
    }
</script>

<h3>Account</h3>
<TabContent>
    <TabPane class="pt-4" tabId="detail" tab="Detail" active>
        <Row>
            <Col>
                <Label for="email" >Email</Label>
                <InputGroup>
                    <Input type="email" name="email" bind:value={$user.email} required placeholder="Email" disabled />
                    <InputGroupText>
                        <Button size="sm" title="Change email" color="primary" disabled>
                            <Icon name="pencil-square" />
                        </Button>
                    </InputGroupText>
                </InputGroup>
            </Col>
            <Col>
            </Col>
            <Col>
            </Col>
        </Row>
        <Button class="mt-4" color="primary" id="btn-trigger">Sign Out</Button>
        <Popover placement="bottom" target="btn-trigger"title="Confirm Sign Out">
            <div>Do you really want to sign out?</div>
            <Button block class="mt-2" size="sm" color="danger" on:click={signOutClicked}>Sign Out</Button>
        </Popover>
    </TabPane>

    <TabPane class="pt-4" tabId="subscription" tab="Subscription">
        {#await getSubscription()}
            <Spinner color="primary"/>
        {:then}
            <Row>
                <Col>
                    <Label for="subscriptionStatus">Status</Label>
                    <InputGroup>
                        <Input type="text" name="subscriptionStatus" value={subscription.status == "trialing" ? "Free Trial" : subscription.status} disabled />
                    </InputGroup>
                </Col>
                <Col>
                    {#if subscription.status == 'trialing'}
                        <Label for="trialEnds">Trial Ends</Label>
                        <InputGroup>
                            <Input type="text" name="trialEnds" value={new Date(subscription.trial_end*1000).toLocaleDateString()} required disabled />
                        </InputGroup>
                    {/if}
                </Col>
                <Col>
                </Col>
            </Row>
        {/await}
        <Button class="mt-4" color="success" id="btn-trigger">Upgrade ...</Button>
    </TabPane>
</TabContent>
