<script lang="ts">
	import '../app.css';
	import { auth } from '../lib/firebase/firebase';
	import { authStore } from '../stores/authStore';
	import { onMount } from 'svelte';
	import { goto } from "$app/navigation";
	let { children } = $props();


	onMount(()=>{
		const unsubscribe = auth.onAuthStateChanged(async (user) => {
            // Update the authStore with the current user information
            authStore.update((curr) => ({ ...curr, isLoading: false, currentUser: user }));
            // If the user is not authenticated and the current path is not the home page, redirect to home
            if (!user && window.location.pathname !== '/login') {
                goto("/login");
            }
            
            console.log(user);
        });

        // Return an unsubscribe function to clean up the auth listener
        return () => unsubscribe();
	})

</script>



{@render children()}
