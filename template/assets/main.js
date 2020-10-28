
function addAccordionListener() {
    const rows = document.querySelectorAll('.jobs-row');

    function closeRows(rows) {
        rows.forEach(row => {
            row.classList.remove('open');
        });
    }

    rows.forEach(row => {
       row.addEventListener('click', () => {
           if(row.classList.contains('open')) {
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

addAccordionListener();
