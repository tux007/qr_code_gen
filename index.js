document.addEventListener("DOMContentLoaded", function () {
  const qrTypeRadios = document.querySelectorAll(".qr-type-radio");
  const urlFields = document.querySelector(".url-fields");
  const vcardFields = document.querySelector(".vcard-fields");
  const generateCodeButton = document.querySelector(".generate-qr-code");
  let qrImage = document.querySelector(".qr-image");
  let qrCanvas = document.querySelector(".qr-canvas");
  const loading = document.querySelector(".loading");

  // Custom Alert Elemente
  const alertOverlay = document.getElementById("alertOverlay");
  const alertMessage = document.getElementById("alertMessage");
  const alertClose = document.getElementById("alertClose");

  // Felder für URL-Modus
  const user_url = document.querySelector(".user-url");

  // Felder für vCard-Modus
  const user_name = document.querySelector(".user-name");
  const user_email = document.querySelector(".user-email");
  const user_phone = document.querySelector(".user-phone");
  const user_url_vcard = document.querySelector(".user-url-vcard");

  // Direkt-Öffnen Button
  const openDirectBtn = document.getElementById("openDirectBtn");
  const clearBtn = document.getElementById("clearBtn");
  let currentData = null;
  let currentType = null;

  // Custom Alert Funktion
  function showAlert(message) {
    alertMessage.textContent = message;
    alertOverlay.classList.add("show");
  }

  // Alert schliessen
  alertClose.addEventListener("click", () => {
    alertOverlay.classList.remove("show");
  });

  // Alert schliessen beim Klick auf Overlay
  alertOverlay.addEventListener("click", (e) => {
    if (e.target === alertOverlay) {
      alertOverlay.classList.remove("show");
    }
  });

  // Initiale Sichtbarkeit setzen
  urlFields.style.display = "flex";
  vcardFields.style.display = "none";

  // Wechsel zwischen URL und vCard Modus
  qrTypeRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.value === "url") {
        urlFields.style.display = "flex";
        vcardFields.style.display = "none";
      } else {
        urlFields.style.display = "none";
        vcardFields.style.display = "flex";
      }
      
      // Setze QR-Code und Buttons beim Moduswechsel zurück
      qrImage.src = '';
      qrImage.style.display = 'none';
      openDirectBtn.style.display = 'none';
      clearBtn.style.display = 'none';
      currentData = null;
      currentType = null;
    });
  });

  // vCard Format erstellen
  function createVCard(name, email, phone, url) {
    let vcard = "BEGIN:VCARD\n";
    vcard += "VERSION:3.0\n";
    if (name) vcard += `FN:${name}\n`;
    if (email) vcard += `EMAIL:${email}\n`;
    if (phone) vcard += `TEL:${phone}\n`;
    if (url) vcard += `URL:${url}\n`;
    vcard += "END:VCARD";
    return vcard;
  }

  generateCodeButton.onclick = async () => {
    qrImage.src = "";
    const selectedType = document.querySelector(
      'input[name="qr-type"]:checked'
    ).value;
    let userData;
    let isValid = false;

    if (selectedType === "url") {
      const url = user_url.value.trim();
      if (url) {
        userData = url;
        isValid = true;
      } else {
        showAlert("Bitte geben Sie eine URL ein!");
      }
    } else {
      // vCard Modus
      const name = user_name.value.trim();
      const email = user_email.value.trim();
      const phone = user_phone.value.trim();
      const url = user_url_vcard.value.trim();

      if (name || email || phone) {
        userData = createVCard(name, email, phone, url);
        isValid = true;
      } else {
        showAlert("Bitte geben Sie mindestens Name, Email oder Telefon ein!");
      }
    }

    if (isValid) {
      loading.style.display = "block";
      let imgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        userData
      )}`;

      try {
        let response = await fetch(imgSrc);
        let data = await response.blob();
        qrImage.src = URL.createObjectURL(data);
        qrImage.style.display = "block";
        loading.style.display = "none";

        // Speichere aktuelle Daten und Typ für direktes Öffnen
        currentData = userData;
        currentType = selectedType;
        openDirectBtn.style.display = "block";
        clearBtn.style.display = "block";

        // URL nach einiger Zeit freigeben
        setTimeout(() => URL.revokeObjectURL(qrImage.src), 60000);
      } catch (error) {
        showAlert("Fehler beim Erstellen des QR-Codes!");
        loading.style.display = "none";
      }
    }
  };

  // Direkt-Öffnen Funktionalität
  openDirectBtn.addEventListener("click", () => {
    if (currentType === "url") {
      // URL direkt öffnen - stelle sicher, dass Protokoll vorhanden ist
      let urlToOpen = currentData;
      if (!urlToOpen.match(/^https?:\/\//i)) {
        urlToOpen = "https://" + urlToOpen;
      }
      window.open(urlToOpen, "_blank");
    } else if (currentType === "vcard") {
      // vCard als .vcf Datei zum Download anbieten
      const blob = new Blob([currentData], {
        type: "text/vcard;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "contact.vcf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showAlert(
        "vCard wird heruntergeladen. Öffnen Sie die Datei, um den Kontakt zu speichern."
      );
    }
  });

  // Clear Funktionalität
  clearBtn.addEventListener("click", () => {
    // Leere alle Input-Felder
    user_url.value = "";
    user_name.value = "";
    user_email.value = "";
    user_phone.value = "";
    user_url_vcard.value = "";

    // Setze QR-Code Bild zurück
    qrImage.src = "";
    qrImage.style.display = "none";

    // Verstecke Buttons
    openDirectBtn.style.display = "none";
    clearBtn.style.display = "none";

    // Setze gespeicherte Daten zurück
    currentData = null;
    currentType = null;
  });
});
