<template>
  <div class="row justify-content-center">
    <div class="col-md-10 col-lg-8 col-xl-9 col-xxl-8 col-xxxl-6">
      <div class="card mb-25 border-0 rounded-0 bg-white authentication-card">
        <div class="card-body letter-spacing">
          <h4 class="text-black fw-bold mb-0 text-center">
            Create Your Account
          </h4>
          <form @submit.prevent="register">
            <div class="form-group mb-15 mb-sm-20 mb-md-25">
              <label class="d-block text-black fw-semibold mb-10">Name</label>
              <input type="text" class="form-control shadow-none rounded-0 text-black" placeholder="e.g. Jacob Adam" />
            </div>
            <div class="form-group mb-15 mb-sm-20 mb-md-25">
              <label class="d-block text-black fw-semibold mb-10">
                Email Address
              </label>
              <input type="email" class="form-control shadow-none rounded-0 text-black" placeholder="john.doe@gmail.com"
                v-model="register_form.email" />
            </div>
            <div class="form-group mb-15 mb-sm-20 mb-md-25">
              <label class="d-block text-black fw-semibold mb-10">
                Password
              </label>
              <input type="password" class="form-control shadow-none rounded-0 text-black" placeholder="**************"
                v-model="register_form.password" />
            </div>
            <div class="form-group mb-15 mb-sm-20 mb-md-25">
              <label class="d-block text-black fw-semibold mb-10">
                Confirm Password
              </label>
              <input type="password" class="form-control shadow-none rounded-0 text-black" placeholder="**************" />
            </div>
            <div class="form-check form-check-primary mb-0 fs-md-15 fs-lg-16 text-muted lh-1 mb-15 mb-md-20">
              <input class="form-check-input shadow-none" type="checkbox" id="remember-me" />
              <label class="form-check-label" for="remember-me">
                I accept All
                <a href="#" class="text-decoration-none">Terms & Conditions</a>
              </label>
            </div>
            <button
              class="default-btn transition border-0 fw-medium text-white rounded-1 fs-md-15 fs-lg-16 bg-success d-block w-100"
              type="submit">
              Register Now
            </button>
            <span class="d-block text-muted text-center mt-15 mt-md-30 mb-12 mb-md-20 fs-md-15 fs-lg-16">
              Already Have An Account?
            </span>
            <router-link to="/login"
              class="default-btn with-border transition fw-medium rounded-1 fs-md-15 fs-lg-16 d-block w-100 text-decoration-none text-center">
              Log In Now
            </router-link>
            <span
              class="d-block or text-muted text-center mt-15 mb-15 mt-md-20 mb-md-20 fs-md-15 fs-lg-16 position-relative z-1 lh-1">
              <span class="d-inline-block bg-white">Or</span>
            </span>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useStore } from "vuex";

export default {
  name: "RegisterContent",
  setup() {
    const register_form = ref({});
    const store = useStore();

    const register = () => {
      store.dispatch("register", register_form.value);
    };

    return {
      register_form,
      register
    }
  }
};
</script>