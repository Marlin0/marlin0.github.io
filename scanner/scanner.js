document.addEventListener("DOMContentLoaded", function() {
    const startScannerBtn = document.getElementById("start_scanner_btn");
    const resultElement = document.getElementById("result");
    const errorElement = document.getElementById("error");
    const scannerContainer = document.getElementById("scanner-container");

    let captureSession; 

    startScannerBtn.addEventListener("click", function() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            errorElement.innerText = "你的浏览器不支持相机访问。请使用现代浏览器如Chrome或Firefox。";
            return;
        }

        captureSession = new Quagga.Session({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: scannerContainer, 
                constraints: {
                    width: 640,
                    height: 480,
                    facingMode: "environment" 
                },
            },
            decoder: {
                readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
            }
        });

        captureSession.init(function(err) {
            if (err) {
                console.error(err);
                errorElement.innerText = "初始化 Quagga 时出错：" + err;
                return;
            }
            console.log("Initialization finished. Ready to start");
            captureSession.start();
        });

        captureSession.onDetected(function(data) {
            resultElement.innerText = `Barcode detected and processed : [${data.codeResult.code}]`;
            captureSession.stop(); 
        });

        captureSession.onProcessed(function(result) {
            if (result) {
                if (result.boxes) {
                    result.boxes.forEach(function (box) {
                        Quagga.CameraAccess.drawBox(box, {color: 'green', lineWidth: 2}, scannerContainer);
                    });
                }
            }
        });
    });
});
