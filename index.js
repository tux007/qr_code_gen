document.addEventListener("DOMContentLoaded", function() {
    const qrTypeRadios = document.querySelectorAll('.qr-type-radio');
    const urlFields = document.querySelector('.url-fields');
    const vcardFields = document.querySelector('.vcard-fields');
    const generateCodeButton = document.querySelector('.generate-qr-code');
    let qrImage = document.querySelector('.qr-image');
    let qrCanvas = document.querySelector('.qr-canvas');
    const loading = document.querySelector('.loading');

    // Custom Alert Elemente
    const alertOverlay = document.getElementById('alertOverlay');
    const alertMessage = document.getElementById('alertMessage');
    const alertClose = document.getElementById('alertClose');

    // Felder für URL-Modus
    const user_url = document.querySelector('.user-url');
    
    // Felder für vCard-Modus
    const user_name = document.querySelector('.user-name');
    const user_email = document.querySelector('.user-email');
    const user_phone = document.querySelector('.user-phone');
    const user_url_vcard = document.querySelector('.user-url-vcard');

    // Custom Alert Funktion
    function showAlert(message) {
        alertMessage.textContent = message;
        alertOverlay.classList.add('show');
    }

    // Alert schließen
    alertClose.addEventListener('click', () => {
        alertOverlay.classList.remove('show');
    });

    // Alert schließen beim Klick auf Overlay
    alertOverlay.addEventListener('click', (e) => {
        if(e.target === alertOverlay) {
            alertOverlay.classList.remove('show');
        }
    });

    // Initiale Sichtbarkeit setzen
    urlFields.style.display = 'flex';
    vcardFields.style.display = 'none';

    // Wechsel zwischen URL und vCard Modus
    qrTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if(this.value === 'url') {
                urlFields.style.display = 'flex';
                vcardFields.style.display = 'none';
            } else {
                urlFields.style.display = 'none';
                vcardFields.style.display = 'flex';
            }
        });
    });

    // vCard Format erstellen
    function createVCard(name, email, phone, url) {
        let vcard = 'BEGIN:VCARD\n';
        vcard += 'VERSION:3.0\n';
        if(name) vcard += `FN:${name}\n`;
        if(email) vcard += `EMAIL:${email}\n`;
        if(phone) vcard += `TEL:${phone}\n`;
        if(url) vcard += `URL:${url}\n`;
        vcard += 'END:VCARD';
        return vcard;
    }

    generateCodeButton.onclick = async () => {
        qrImage.src = '';
        const selectedType = document.querySelector('input[name="qr-type"]:checked').value;
        let userData;
        let isValid = false;

        if(selectedType === 'url') {
            const url = user_url.value.trim();
            if(url) {
                userData = url;
                isValid = true;
            } else {
                showAlert('Bitte geben Sie eine URL ein!');
            }
        } else {
            // vCard Modus
            const name = user_name.value.trim();
            const email = user_email.value.trim();
            const phone = user_phone.value.trim();
            const url = user_url_vcard.value.trim();
            
            if(name || email || phone) {
                userData = createVCard(name, email, phone, url);
                isValid = true;
            } else {
                showAlert('Bitte geben Sie mindestens Name, Email oder Telefon ein!');
            }
        }

        if(isValid) {
            loading.style.display = 'block';
            let imgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(userData)}`;
            
            try {
                let response = await fetch(imgSrc);
                let data = await response.blob();
                qrImage.src = URL.createObjectURL(data);
                loading.style.display = 'none';
                
                // URL nach einiger Zeit freigeben
                setTimeout(() => URL.revokeObjectURL(qrImage.src), 60000);
            } catch(error) {
                showAlert('Fehler beim Erstellen des QR-Codes!');
                loading.style.display = 'none';
            }
        }
    };
});
