
function generateCaptcha() {
    const captchaText = document.getElementById("captchaText");
    const captcha = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // Random 4-digit number
    captchaText.innerText = captcha;
    return captcha;
}

let currentCaptcha = generateCaptcha();

document.getElementById('downloadForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const appId = document.getElementById('appId').value;
    const applicantName = document.getElementById('applicantName').value;
    const captchaInput = document.getElementById('captcha').value;

    if (captchaInput !== currentCaptcha) {
        document.getElementById('message').innerText = "Invalid CAPTCHA. Please try again.";
        currentCaptcha = generateCaptcha(); 
        return;
    }

   
    document.getElementById('message').innerText = `Certificate for ${applicantName} (ID: ${appId}) has been downloaded.`;

  
    document.getElementById('downloadForm').reset();
    currentCaptcha = generateCaptcha();
});


window.onload = generateCaptcha;
