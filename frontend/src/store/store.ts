import { createStore } from 'vuex';
import router from '../router';
import { auth } from '../firebase';
import {
    onAuthStateChanged,
    UserCredential,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    signInWithRedirect,
    GoogleAuthProvider,
    GithubAuthProvider,
    getRedirectResult
} from 'firebase/auth';

import { createToaster } from "@meforma/vue-toaster";
import { getUserById, createUser } from '../services/user';

import { CustomUser } from '@/models/customUser';

const toaster = createToaster({
    position: "bottom",
    duration: 3000,
});


const store = createStore({
    state: {
        user: null,
        customUser: null,
        authIsReady: false
    },
    mutations: {
        SET_USER(state, user) {
            state.user = user;
        },

        CLEAR_USER(state) {
            state.user = null
        },

        SET_AUTH_IS_READY(state, status) {
            state.authIsReady = status;
        },

        SET_CUSTOM_USER(state, customUser) {
            state.customUser = customUser;
        },

    },
    actions: {
        async login({ commit }, details) {
            const { email, password } = details;
            await signInWithEmailAndPassword(auth, email, password)
                .then((userCredential: UserCredential) => {
                    // Check if the email is verified
                    if (userCredential.user.emailVerified) {
                        commit('SET_USER', userCredential.user);
                        router.push('/');
                    } else {
                        toaster.warning("Please verify your email to log in!");
                        setTimeout(async () => {
                            await signOut(auth)
                                .then(() => {
                                    commit('CLEAR_USER');
                                    router.push('/verification');
                                })
                        }, 3000);
                    }
                })
                .catch((error) => {
                    switch (error.code) {
                        case 'auth/user-not-found':
                            toaster.warning("User not found!");
                            break
                        case 'auth/wrong-password':
                            toaster.warning("Wrong password!");
                            break
                        case 'auth/invalid-credential':
                            toaster.warning("Invalid credential!");
                            break
                        default:
                            toaster.error("An error occurred! Please retry later");
                    }

                    return
                })
        },

        async register({ commit }, details) {
            const { email, password } = details

            createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    sendEmailVerification(userCredential.user);
                })
                .then(() => {
                    commit('SET_USER', auth.currentUser);
                    router.push('/verification');
                })
                .catch((error) => {
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            toaster.error("Email already in use");
                            break
                        case 'auth/invalid-email':
                            toaster.error("Invalid email");
                            break
                        case 'auth/operation-not-allowed':
                            toaster.error("Operation not allowed");
                            break
                        case 'auth/weak-password':
                            toaster.warning("Weak password");
                            break
                        default:
                            toaster.error("An error occurred!");
                    }

                    return
                })

        },

        async logout({ commit }) {
            await signOut(auth)

            commit('CLEAR_USER')

            router.push('/login')
        },

        async loginGoogle() {
            const provider = new GoogleAuthProvider();
            signInWithRedirect(auth, provider)
                .catch((error) => {
                    error.code;
                    toaster.error("An error occurred during Google login!");
                });
        },

        async loginGithub() {
            const provider = new GithubAuthProvider();
            signInWithRedirect(auth, provider)
                .catch((error) => {
                    toaster.error("An error occurred during GitHub login!");
                    error.code;
                });
        },

        async handleRedirect({ commit }) {
            console.log('handle redirect');
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    commit('SET_USER', result.user);
                }
            } catch (error) {
                toaster.error("An error occurred!");
                // Handle errors here, such as email already in use, invalid email, etc.
            }
        },

    }
});

const unsub = onAuthStateChanged(auth, async (user) => {
    let customUser: CustomUser;
    if (user && !store.state.customUser) {
        const response = await getUserById(user.uid);
        if (response.status != 200) {
            const response = createUser(user);
            console.log(response);
            customUser.uid = user.uid;
            customUser.email = user.email;
            customUser.displayName = user.displayName;
            customUser.photoURL = user.photoURL;
            customUser.bio = "";
            customUser.country = "";
        } else {
            customUser = response.data;
        }
    }

    store.commit('SET_AUTH_IS_READY', true);
    store.commit('SET_USER', user);
    store.commit('SET_CUSTOM_USER', customUser);
    console.log('STATE: onAuthStateChanged')
    unsub();
})

export default store;