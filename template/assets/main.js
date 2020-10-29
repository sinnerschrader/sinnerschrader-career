window.filterOptions = {
    level: 'All',
    discipline: 'All',
    company: 'All',
    location: 'All'
};

function addAccordionListener() {
    const rows = document.querySelectorAll('.jobs-row');

    function closeRows(rows) {
        rows.forEach(row => {
            row.classList.remove('open');
        });
    }

    rows.forEach(row => {
        row.addEventListener('click', () => {
            if (row.classList.contains('open')) {
                row.classList.remove('open');
            } else {
                // close all rows
                closeRows(rows);
                // open this one
                row.classList.add('open');
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
        const jobElements = document.querySelectorAll('[id^="job-"]');
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
                    (window.filterOptions.company !== 'All' && it.company !== window.filterOptions.company) ||
                    (window.filterOptions.location !== 'All' && it.location !== window.filterOptions.location);
            });

        hideJobs(filteredOutJobs);
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

    addListeners('level', '.filter--level .filter-item');
    addListeners('discipline', '.filter--discipline .filter-item');
    addListeners('company', '.filter--company .filter-item');
    addListeners('location', '.filter--location .filter-item');
}

addAccordionListener();
addFilter();
