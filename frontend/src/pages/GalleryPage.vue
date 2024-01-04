<template>
  <BreadCrumb PageTitle="Gallery" />
  <GalleryThree />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "../utils/http";
import store from "../store/store";

import BreadCrumb from "../components/Common/BreadCrumb.vue";
import GalleryThree from "../components/Gallery/GalleryThree.vue";

export default defineComponent({
  name: "GalleryPage",
  components: {
    BreadCrumb,
    GalleryThree,
  },
  mounted() {
    const user = store.state.user;
    if (user) {
      console.log("user: ", user);
      axios
        .post('/users', {
          uid: user["uid"],
          email: user["email"]
        })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        })
    }

  },
});
</script>