<template>
  <div class="row justify-content-center">
    <div class="col-md-10 col-lg-8 col-xl-9 col-xxl-8 col-xxxl-6">
      <div class="card mb-25 border-0 rounded-0 bg-white authentication-card">
        <div class="card-body letter-spacing">
          <h4 class="text-black fw-bold mb-0 text-center">
            Sign In To Your Account!
          </h4>
          <form @submit.prevent="login">
            <div class="form-group mb-15 mb-sm-20 mb-md-25">
              <label class="d-block text-black fw-semibold mb-10">
                Email Address
              </label>
              <input type="email" class="form-control shadow-none rounded-0 text-black" placeholder="john.doe@gmail.com"
                v-model="login_form.email" />
            </div>
            <div class="form-group mb-15 mb-sm-20 mb-md-25">
              <label class="d-block text-black fw-semibold mb-10">
                Password
              </label>
              <input type="password" class="form-control shadow-none rounded-0 text-black" placeholder="**************"
                v-model="login_form.password" />
            </div>
            <div class="d-flex align-items-center justify-content-between mb-15 mb-md-20">
              <router-link to="/"
                class="forgot-password-btn fs-md-15 fs-lg-16 text-decoration-none position-relative text-primary">
                Forgot Password?
              </router-link>
            </div>
            <button
              class="default-btn transition border-0 fw-medium text-white rounded-1 fs-md-15 fs-lg-16 bg-success d-block w-100"
              type="submit">
              Sign In Now
            </button>
            <span class="d-block text-muted text-center mt-15 mt-md-30 mb-12 mb-md-20 fs-md-15 fs-lg-16">
              Don’t have an account?
            </span>
            <router-link to="/register"
              class="default-btn with-border transition fw-medium rounded-1 fs-md-15 fs-lg-16 d-block w-100 text-decoration-none text-center">
              Create Account
            </router-link>
            <span
              class="d-block or text-muted text-center mt-15 mb-15 mt-md-20 mb-md-20 fs-md-15 fs-lg-16 position-relative z-1 lh-1">
              <span class="d-inline-block bg-white">Or</span>
            </span>
            <ul class="socials ps-0 mb-0 list-unstyled text-center">
              <li class="d-inline-block">
                <button type="button" class="d-block rounded-circle text-center position-relative google border-0 p-0"
                  @click="loginGoogle">
                  <i class="ph-bold ph-google-logo"></i>
                </button>
              </li>
              <li class="d-inline-block">
                <button type="button" class="d-block rounded-circle text-center position-relative github border-0 p-0"
                  @click="loginGithub">
                  <i class="ph-fill ph-github-logo"></i>
                </button>
              </li>
            </ul>
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
  name: "LoginForm",
  setup() {
    const login_form = ref({});

    const store = useStore();
    store.dispatch('handleRedirect');

    const login = () => {
      store.dispatch("login", login_form.value);
    };

    const loginGoogle = () => {
      store.dispatch("loginGoogle");
    };

    const loginGithub = () => {
      store.dispatch("loginGithub");
    };

    return {
      login_form,
      login,
      loginGoogle,
      loginGithub
    }


  }

};
</script>