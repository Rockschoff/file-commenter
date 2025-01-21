<script>
    import { onMount } from "svelte";
    import { authStore, authHandlers } from "../../stores/authStore";
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';

    onMount(() => {
        authStore.update((user) => {
            console.log("Logging you out...");
            user.currentUser = null;
            user.isLoading = false;
            return user;
        });
    });

    async function handleSubmit() {
        if (!email || !password) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            await authHandlers.login(email, password);
            console.log('Login successful, redirecting...');
            goto("./");
        } catch (err) {
            console.log('Login error:', err);
            alert('Login failed. Please check your credentials and try again.');
        }
    }
</script>

<div class="h-[100vh] w-[100vw] bg-gradient-to-br from-blue-200 to-red-200">

    <div id="header" class="flex justify-center items-center p-10 h-[30vh] w-full">
        <img src="./logo.png" alt="Logo Of InnovaQ">
    </div>

    <div class="h-[70vh] w-full flex justify-center items-center">
        <form 
            class="bg-white shadow-lg rounded-lg p-10 w-[90%] max-w-md"
            on:submit|preventDefault={handleSubmit}
        >
            <h1 class="text-2xl font-semibold mb-6 text-center">Login</h1>

            <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    bind:value={email} 
                    required 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div class="mb-6">
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    bind:value={password} 
                    required 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <button 
                type="submit" 
                class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            >
                Login
            </button>
        </form>
    </div>
</div>
