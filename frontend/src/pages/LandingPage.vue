<template>
    <div class="card mb-15 border-0 rounded-0 bg-white text-center starter-card">
        <div class="card-body letter-spacing" style="padding: 25px !important;">
            <img src="../assets/images/welcome.png" alt="starter-image" />
            <h1 class="fw-bold text-black">
                Welcome To SimiliSnap. Let’s Create Your Own Gallery.
            </h1>
            <router-link to="/login"
                class="default-btn transition border-0 fw-medium text-white pt-10 pb-10 ps-25 pe-25 pt-md-12 pb-md-12 ps-md-35 pe-md-35 rounded-1 fs-md-15 fs-lg-16 bg-success"
                type="submit">
                Get Started></router-link>

        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "LandingPage"
});
</script>
