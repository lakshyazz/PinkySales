</div>
</div>

<script src="assets/js/highlight.min.js"></script>
<script src="assets/js/alpine-collaspe.min.js"></script>
<script src="assets/js/alpine-persist.min.js"></script>
<script src="assets/js/flatpickr.js"></script>
<script defer src="assets/js/alpine-ui.min.js"></script>
<script defer src="assets/js/alpine-focus.min.js"></script>
<script defer src="assets/js/alpine.min.js"></script>
<script src="assets/js/custom.js"></script>
<script defer src="assets/js/apexcharts.js"></script>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('scrollToTop', () => ({
            showTopButton: false,
            init() {
                window.onscroll = () => {
                    this.scrollFunction();
                };
            },

            scrollFunction() {
                if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
                    this.showTopButton = true;
                } else {
                    this.showTopButton = false;
                }
            },

            goToTop() {
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
            },
        }));

        // sidebar section
        Alpine.data('sidebar', () => ({
            init() {
                const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
                if (selector) {
                    selector.classList.add('active');
                    const ul = selector.closest('ul.sub-menu');
                    if (ul) {
                        let ele = ul.closest('li.menu').querySelectorAll('.nav-link');
                        if (ele) {
                            ele = ele[0];
                            setTimeout(() => {
                                ele.click();
                            });
                        }
                    }
                }
            },
        }));

        // header section
        Alpine.data('header', () => ({
            notifications: [],
            init() {
                const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location
                    .pathname + '"]');
                if (selector) {
                    selector.classList.add('active');
                    const ul = selector.closest('ul.sub-menu');
                    if (ul) {
                        let ele = ul.closest('li.menu').querySelectorAll('.nav-link');
                        if (ele) {
                            ele = ele[0];
                            setTimeout(() => {
                                ele.classList.add('active');
                            });
                        }
                    }
                }
                // this.getNotifications();
                // setInterval(() => {
                //     this.getNotifications();
                // }, 6000);
            },

            getNotifications() {
                fetch('./ajax/notifications.php?action=get_notification')
                    .then(response => response.json())
                    .then(data => {
                        if (data.length > 0) {
                            this.notifications = data;
                            this.playNotificationSound();
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching notifications:', error);
                    });
            },

            readAllNotification(){
                const http = new XMLHttpRequest();
                http.onload = () => {
                    this.getNotifications();
                }
                http.open("GET", "./ajax/notifications.php?action=read_all_notification");
                http.send();
            },

            playNotificationSound() {
                fetch('./ajax/notifications.php?action=play_noti_sound')
                    .then(res => res.text())
                    .then(data => {
                        const [numNotifications, notificationIds] = data.split('@@@');
                        if (numNotifications > 0) {
                            let audioSource = '<source src="./assets/sound.mp3" type="audio/mpeg">';
                            document.getElementById("sound").innerHTML = `<audio autoplay>${audioSource}</audio>`;
                            this.removeNotificationSound(notificationIds);
                        }
                    })
                    .catch(error => {
                        console.error('Error Playing sound:', error);
                    })
            },

            removeNotificationSound(id) {
                const http = new XMLHttpRequest();
                http.onload = () => {
                    console.log(http.responseText);
                    document.getElementById("sound").innerHTML = "";
                }
                http.open("GET", "./ajax/notifications.php?action=remove_noti_sound&ids=" + id);
                http.send();
            },

            removeNotification(id) {
                console.log(id);
                const http = new XMLHttpRequest();
                http.onload = () => {
                    console.log(http.responseText)
                }
                http.open("GET", "./ajax/notifications.php?action=remove_notification&id=" + id);
                http.send();
                this.notifications = this.notifications.filter(notification => notification.id !== id);
            },
        }));
    });
</script>
</body>

</html>
