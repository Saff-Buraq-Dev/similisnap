// user.ts
import axios from '../utils/http';

export async function getUserById(userId: string) {
    return axios.get(`/users/${userId}`)
        .then(response => {
            return { data: response.data, status: 200 };
        })
        .catch((error) => {
            console.log(error);
            return { data: null, status: 400 };
        });
}

export async function createUser(user) {
    axios
        .post('/users', {
            uid: user["uid"],
            email: user["email"],
            displayName: user["displayName"],
            country: "",
            bio: ""
        })
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        })
}

export async function updateUser(user) {
    axios
        .put('/users', {
            uid: user["uid"],
            email: user["email"],
            displayName: user["displayName"],
            bio: user["bio"],
            country: user["country"],
        })
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        })
}