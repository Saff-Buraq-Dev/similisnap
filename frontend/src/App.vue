<template>
  <MainHeader />
  <MainSidebar />
  <div class="main-content d-flex flex-column transition overflow-hidden">
    <router-view />
    <MainFooter />
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { useStore } from "vuex";
import { defineComponent, watchEffect, onBeforeMount } from "vue";
import stateStore from "./utils/store";

import MainHeader from "./components/Layouts/MainHeader.vue";
import MainSidebar from "./components/Layouts/MainSidebar.vue";
import MainFooter from "./components/Layouts/MainFooter.vue";

export default defineComponent({

  name: "App",
  components: {
    MainHeader,
    MainSidebar,
    MainFooter,
  },
  mounted() {
    document.body.classList.add("bg-body-secondary");
  },
  setup() {
    const store = useStore();

    onBeforeMount(() => {
      store.dispatch('fetchUser').then(() => {
        if (store.state.user && !store.state.user.customAttributes) {
          const user = store.state.user;
          axios.get(`/users/${user.uid}`)
            .then(response => {
              console.log(response);
              // Display Name
              if (!user.displayName && response.data.displayName) {
                user.displayName = response.data.displayName;
              } else if (!user.displayName && !response.data.displayName) {
                user.displayName = user.email;
              }
              // Photo URL
              if (!user.photoUrl && response.data.profilePicExists) {
                user.photoUrl = `${user.uid}/profile/profile_pic.png`;
              } else if (!user.photoUrl && !response.data.profilePicExists) {
                user.photoUrl = '../../assets/images/anonymous-user.png';
              }
              user.customAttributes = response.data;
              store.commit('SET_USER', user);
            })
            .catch(error => {
              console.error('Error fetching custom attributes:', error);
            });
        }
      });
    });
    const stateStoreInstance = stateStore;
    watchEffect(() => {
      if (stateStoreInstance.open) {
        document.body.classList.remove("sidebar-show");
        document.body.classList.add("sidebar-hide");
      } else {
        document.body.classList.remove("sidebar-hide");
        document.body.classList.add("sidebar-show");
      }
    });
    return {};
  },
});
</script>