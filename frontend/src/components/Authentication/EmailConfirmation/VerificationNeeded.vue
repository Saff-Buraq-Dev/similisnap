<template>
    <div class="row justify-content-center">
        <div class="col-md-10 col-lg-8 col-xl-9 col-xxl-8 col-xxxl-5">
            <div class="card mb-25 border-0 rounded-0 bg-white authentication-card email-confirmation-card">
                <div class="card-body letter-spacing">
                    <div
                        class="icon mb-20 mb-sm-25 mb-md-30 md-lg-35 text-success text-center rounded-circle position-relative ms-auto me-auto">
                        <i class="flaticon-check"></i>
                    </div>
                    <h4 class="text-black fw-bold mb-0 text-center">
                        You need to Verify your email!
                    </h4>
                    <p class="mb-0 fs-md-15 fs-lg-16 text-paragraph text-center sub-text">
                        Thank you for joining SimiliSnap! We're thrilled to have you on board. To get started, there's just
                        one small step you need to take.
                    </p>
                    <p class="mb-0 fs-md-15 fs-lg-16 text-paragraph text-center sub-text">
                        Please check your email inbox for a verification message from us. Clicking on the verification link
                        in that email will activate your account and grant you full access to all the features we offer.
                    </p>
                    <router-link
                        class="default-btn transition border-0 fw-medium text-white rounded-1 fs-md-15 fs-lg-16 d-block w-100 text-decoration-none text-center mt-15 mt-sm-20 mt-md-25 mt-lg-30"
                        to="/">
                        Back To Home
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "VerificationNeeded",
};
</script>