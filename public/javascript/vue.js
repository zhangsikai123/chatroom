app = new Vue({
    el: '#app',
    data: {
        name: 'Sikai',
        message: 'Hello from ' + new Date().toLocaleDateString(),
        shown: true,
        things: ["read", "work", "play"]
    }
})