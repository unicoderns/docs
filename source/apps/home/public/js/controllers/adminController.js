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
            {
                var newRepository = this.$data.newRepository;
                this.$http.post('/api/v1/new/', JSON.stringify(newRepository))
                    .then(function (response) {
                        this.$data.repositories.push(newRepository);
                        newRepository.name = '';
                        newRepository.url = '';
                        newRepository.mount = '';
                        newRepository.folder = '';
                        console.log(response);
                    }, function (response) {
                        console.error(response);
                    });
            }
        },
        deleteRepository(repository) {
            {
                this.$http.delete('/api/v1/' + repository + '/', {})
                    .then(function (response) {
                        console.log(response);
                    }, function (response) {
                        console.error(response);
                    });
            }
        },
        getRepositories() {
            {
                this.$http.get('/api/v1/').then((response) => {
                    this.repositories = response.body;
                });
            }
        }
    }
})