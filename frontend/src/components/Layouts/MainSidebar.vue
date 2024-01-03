<template>
  <div :class="[
    'sidebar-area position-fixed start-0 top-0 bg-black h-100vh transition',
    { active: stateStoreInstance.open },
  ]" id="sidebar-area">
    <div class="logo position-absolute start-0 end-0 top-0 bg-black">
      <router-link to="/" class="d-flex align-items-center text-white text-decoration-none">
        <img src="../../assets/images/similisnap.png" alt="logo-icon" width="300" />
      </router-link>
      <div class="border-bottom"></div>
      <button class="sidebar-burger-menu position-absolute lh-1 bg-transparent p-0 border-0"
        @click="stateStoreInstance.onChange">
        <i class="ph-duotone ph-caret-double-right"></i>
      </button>
    </div>
    <div class="sidebar-menu">
      <ul class="sidebar-navbar-nav ps-0 mb-0 list-unstyled accordion" id="sidebarNavAccordion">
        <div v-if="!store.state.user">
          <li class="sidebar-nav-item accordion-item bg-transparent border-0 rounded-0" v-if="!store.state.user">
            <a href="#" class="accordion-button rounded-0 shadow-none bg-transparent d-block" data-bs-toggle="collapse"
              data-bs-target="#sidebarCollapseOne" aria-expanded="true" aria-controls="sidebarCollapseOne">
              <i class="flaticon-more-1"></i>
              <span class="title">Connection</span>
            </a>
            <div id="sidebarCollapseOne" class="accordion-collapse collapse show" data-bs-parent="#sidebarNavAccordion">
              <div class="accordion-body">
                <ul class="sidebar-sub-menu ps-0 mb-0 list-unstyled">
                  <li class="sidebar-sub-menu-item">
                    <router-link to="/login" class="sidebar-sub-menu-link">
                      Login
                    </router-link>
                  </li>
                  <li class="sidebar-sub-menu-item">
                    <router-link to="/register" class="sidebar-sub-menu-link">
                      Signup
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </div>
        <div v-else>
          <li class="sub-title sidebar-nav-item">
            <span class="d-block text-uppercase fw-medium">My Space</span>
          </li>
          <li class="sidebar-nav-item">
            <router-link to="/gallery" class="sidebar-nav-link d-block">
              <i class="flaticon-gallery"></i>
              <span class="title">Gallery</span>
            </router-link>
          </li>
          <li class="sidebar-nav-item">
            <router-link to="/" class="sidebar-nav-link d-block">
              <i class="flaticon-search"></i>
              <span class="title">Search</span>
            </router-link>
          </li>
          <li class="sidebar-nav-item accordion-item bg-transparent border-0 rounded-0">
            <a href="#" class="accordion-button collapsed rounded-0 shadow-none bg-transparent d-block"
              data-bs-toggle="collapse" data-bs-target="#sidebarCollapseTwo" aria-expanded="false"
              aria-controls="sidebarCollapseTwo">
              <i class="flaticon-info"></i>
              <span class="title">Infos</span>
            </a>
            <div id="sidebarCollapseTwo" class="accordion-collapse collapse" data-bs-parent="#sidebarNavAccordion">
              <div class="accordion-body">
                <ul class="sidebar-sub-menu ps-0 mb-0 list-unstyled">
                  <li class="sidebar-sub-menu-item">
                    <router-link to="/" class="sidebar-sub-menu-link">Terms Of Service</router-link>
                  </li>
                  <li class="sidebar-sub-menu-item">
                    <router-link to="/" class="sidebar-sub-menu-link">
                      Privacy Policy
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </li>
          <!---->
          <li class="sidebar-nav-item">
            <span class="sidebar-nav-link d-block" style="cursor: pointer;" @click="logout">
              <i class="flaticon-logout"></i>
              <span class="title">Logout</span>
            </span>
          </li>
        </div>


      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import stateStore from "../../utils/store";

export default defineComponent({
  name: "MainSidebar",
  setup() {
    const store = useStore();
    const logout = () => {
      store.dispatch("logout");
    };
    const stateStoreInstance = stateStore;
    return {
      stateStoreInstance,
      logout,
      store
    };
  },
});
</script>