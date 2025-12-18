document.getElementById('trackingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const appId = document.getElementById('appId').value;
    const statusDisplay = document.getElementById('statusDisplay');

   
    checkStatus(appId)
        .then(status => {
            statusDisplay.innerText = `Status for Application ID ${appId}: ${status}`;
        })
        .catch(error => {
            statusDisplay.innerText = `Error: ${error}`;
        });
});


function checkStatus(appId) {
    return new Promise((resolve, reject) => {

        setTimeout(() => {
         
            const statuses = {
                '123': 'Pending',
                '456': 'Approved',
                '789': 'Rejected'
            };
            if (statuses[appId]) {
                resolve(statuses[appId]);
            } else {
                reject('YOUR APPLICATION IS IN PROCESS.KINDLY WAIT FEW DAYS...');
            }
        }, 1000);
    });
}
