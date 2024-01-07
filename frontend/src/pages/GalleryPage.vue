<template>
  <BreadCrumb PageTitle="Gallery" />
  <GalleryThree />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BreadCrumb from "../components/Common/BreadCrumb.vue";
import GalleryThree from "../components/Gallery/GalleryThree.vue";

export default defineComponent({
  name: "GalleryPage",
  components: {
    BreadCrumb,
    GalleryThree,
  },
});
</script>