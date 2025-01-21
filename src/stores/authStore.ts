import { writable, type Writable } from "svelte/store";
import { auth } from "../lib/firebase/firebase";
import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateEmail as firebaseUpdateEmail,
    updatePassword as firebaseUpdatePassword,
    updateProfile,
    type User
} from "firebase/auth";


type AuthStore = {
    isLoading: boolean;
    currentUser: User | null;
};


export const authStore = writable<AuthStore>({
    isLoading: true,
    currentUser: null
});

export const authHandlers = {
    login: async (email: string, password: string) => {
        
        await signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential)
                authStore.update((store) => ({
                    ...store,
                    currentUser: userCredential.user,
                    isLoading: false
                }));
            });
       
    },

    signup: async (email: string, password: string, fname: string, lname: string) => {
        await createUserWithEmailAndPassword(auth, email, password).then(
            (userCredential) => {
                const user = userCredential.user;
                updateProfile(user, {
                    displayName: fname + " " + lname
                })
                    .then(() => {
                        console.log("Profile was updated with the name");
                        authStore.update((store) => ({
                            ...store,
                            currentUser: { ...user, displayName: fname + " " + lname }
                        }));
                    })
                    .catch(async (err) => {
                        try {
                            console.error("Error updating the profile", err);
                            console.log("Here I am with ", user.uid);
                    
                            await new Promise((resolve) => {
                                console.log("Prmise");
                                setTimeout(resolve, 3000);
                            });
                    
                            console.log(window.location.pathname);
                        } catch (error) {
                            console.error("Caught an additional error:", error);
                        }
                    });
            }
        );
    },

    logout: async () => {
        console.log("Logging out ...")
        await signOut(auth);
        console.log("Logged out")
        authStore.update((store) => ({
            ...store,
            currentUser: null
        }));
    },

    resetPassword: async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    },

    updateEmail: async (newEmail: string) => {
        const user = auth.currentUser;
        if (user) {
            await firebaseUpdateEmail(user, newEmail);
            console.log("Email updated successfully");
            authStore.update((store) => ({
                ...store,
                currentUser: { ...user, email: newEmail }
            }));
        } else {
            console.error("No user is signed in");
        }
    },

    updatePassword: async (newPassword: string) => {
        const user = auth.currentUser;
        if (user) {
            await firebaseUpdatePassword(user, newPassword);
            console.log("Password updated successfully");
        } else {
            console.error("No user is signed in");
        }
    },

    updateName: async (name: string) => {
        const user = auth.currentUser;
        if (user) {
            await updateProfile(user, { displayName: name }).then(() => {
                console.log("Name has been updated");
                authStore.update((store) => ({
                    ...store,
                    currentUser: { ...user, displayName: name }
                }));
            });
        } else {
            console.error("No user is signed in");
        }
    }
};

