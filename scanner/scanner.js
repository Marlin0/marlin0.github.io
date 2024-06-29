document.addEventListener("DOMContentLoaded", function() {
    const resultElement = document.getElementById("result");
    
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-container'), // Or '#yourElement' (optional)
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment" // or "user" for front camera
            },
        },
        decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
        }
    }, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("Initialization finished. Ready to start");
        Quagga.start();
    });

    Quagga.onDetected(function(data) {
        resultElement.innerText = `Barcode detected and processed : [${data.codeResult.code}]`;
        Quagga.stop(); // Optionally, you might want to stop the scanner after a barcode is detected
    });
});
