window.filterOptions = {
    level: 'All',
    discipline: 'All',
    location: 'All'
};

function addAccordionListener() {
    const rows = document.querySelectorAll('.js-jobs-row');

    function closeRows(rows) {
        rows.forEach(row => {
            row.classList.remove('is-open');
        });
    }

    rows.forEach(row => {
        row.addEventListener('click', () => {
            if (row.classList.contains('is-open')) {
                row.classList.remove('is-open');
            } else {
                // close all rows
                closeRows(rows);
                // open this one
                row.classList.add('is-open');
            }
        });
    });
}

function addFilter() {
    function removeActive(filterItemElements) {
        filterItemElements.forEach(item => {
            item.childNodes[0].classList.remove('is-active');
        });
    }

    function hideJobs(filteredJobs) {
        const jobElements = document.querySelectorAll('.js-job');
        jobElements.forEach(element => {
            const isHidden = !!filteredJobs.find(it => {
                return element.id === `job-${it.id}`;
            });
            if (isHidden) {
                element.classList.add('is-hidden');
            } else {

                element.classList.remove('is-hidden');
            }
        });
    }

    function updateList() {
        const filteredOutJobs = window.metaData
            .filter(it => {
                return (window.filterOptions.level !== 'All' && it.level !== window.filterOptions.level) ||
                    (window.filterOptions.discipline !== 'All' && it.discipline !== window.filterOptions.discipline) ||
                    (window.filterOptions.location !== 'All' && it.location !== window.filterOptions.location);
            });

        hideJobs(filteredOutJobs);

        // update js-job-counts
        document.querySelector('.js-job-count').innerHTML = `${window.metaData.length - filteredOutJobs.length}`;
    }

    function addListeners(filter, querySelector) {
        const elements = document.querySelectorAll(querySelector);
        elements.forEach(element => {
            element.addEventListener('click', (event) => {
                removeActive(elements);
                element.childNodes[0].classList.add('is-active');
                window.filterOptions[filter] = element.dataset.value;

                updateList();
                event.preventDefault();
            });
        });
    }

    // init job count
    document.querySelector('.js-job-count').innerHTML = `${window.metaData.length}`;

    addListeners('level', '.js-filter--level .js-filter-item');
    addListeners('discipline', '.js-filter--discipline .js-filter-item');
    addListeners('location', '.js-filter--location .js-filter-item');
}

function addFilterAccordionListener() {

    function closeAllLabels() {
        const elements = document.querySelectorAll('.js-filter-label');
        elements.forEach(element => {
           element.parentElement.classList.remove('is-open');
        });
    }

    function addListener(filter) {
        const element = document.querySelector(filter);
        element.addEventListener('click', (event) => {
           if (element.parentElement.classList.contains('is-open')) {
               element.parentElement.classList.remove('is-open');
           } else {
               closeAllLabels();
               element.parentElement.classList.add('is-open');
           }
        });
    }

    addListener('.js-filter--level .js-filter-label');
    addListener('.js-filter--discipline .js-filter-label');
    addListener('.js-filter--location .js-filter-label');
}

addAccordionListener();
addFilter();
addFilterAccordionListener();
