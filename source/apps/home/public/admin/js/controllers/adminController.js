var app = new Vue({
    el: '#app',
    data: {
        repositories: {},
        newRepository: {
            name: '',
            url: '',
            mount: '',
            folder: ''
        }
    },
    created: function () {
        this.getRepositories();
    },
    filters: {
        fromNow: function (date) {
            var offset = moment().utcOffset();
            var localDate = moment.utc(date).add(offset, 'minutes');
            if (date) return localDate.fromNow();
        }
    },
    methods: {
        addRepository() {
            var newRepository = this.$data.newRepository;
            this.$http.post('/api/docs/v1/new/', JSON.stringify(newRepository))
                .then(function (response) {
                    this.$data.repositories.push(newRepository);
                    newRepository.name = '';
                    newRepository.url = '';
                    newRepository.folder = '';
                    console.log(response);
                }, function (response) {
                    console.error(response);
                });
        },
        deleteRepository(repository) {
            this.$http.delete('/api/docs/v1/' + repository + '/', {})
                .then(function (response) {
                    console.log(response);
                }, function (response) {
                    console.error(response);
                });
        },
        updateRepository(repository) {
            this.$http.put('/api/docs/v1/sync/' + repository.id + '/', {})
                .then(function (response) {
                    var now = new Date();
                    var offset = moment().utcOffset();
                    var localDate = moment.utc(now).add(offset * -1, 'minutes');
                    repository.synced = localDate.toISOString();
                    console.log(repository.synced);
                    console.log(response);
                }, function (response) {
                    console.error(response);
                });
        },
        devSyncRepository(repository) {
            this.$http.put('/api/docs/v1/dev/sync/' + repository.id + '/', {})
                .then(function (response) {
                    console.log(repository.synced);
                    console.log(response);
                }, function (response) {
                    console.error(response);
                });
        },
        getRepositories() {
            this.$http.get('/api/docs/v1/')
                .then((response) => {
                    console.log(response.body);
                    this.repositories = response.body;
                });
        }
    }
})