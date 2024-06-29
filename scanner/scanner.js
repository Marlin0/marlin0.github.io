document.addEventListener("DOMContentLoaded", function() {
    const startScannerBtn = document.getElementById("start_scanner_btn");
    const manualBarcodeInput = document.getElementById("manual_barcode_input");
    const addManualBarcodeBtn = document.getElementById("add_manual_barcode_btn");
    const copyBarcodesBtn = document.getElementById("copy_barcodes_btn");
    const exportBarcodesBtn = document.getElementById("export_barcodes_btn");
    const clearBarcodesBtn = document.getElementById("clear_barcodes_btn");
    const barcodeListElement = document.getElementById("barcodes");
    const totalCountElement = document.getElementById("total_count");
    const barcodeCountElement = document.getElementById("barcode_count");
    const scannerContainer = document.getElementById("scanner-container");

    let barcodes = JSON.parse(localStorage.getItem('barcodes')) || {};

    function updateUI() {
        barcodeListElement.innerHTML = '';
        let totalCount = 0;
        let barcodeCount = 0;

        for (let code in barcodes) {
            let li = document.createElement('li');
            li.innerText = `条形码: ${code}, 次数: ${barcodes[code]}`;
            let deleteBtn = document.createElement('button');
            deleteBtn.innerText = '删除';
            deleteBtn.onclick = function () {
                delete barcodes[code];
                localStorage.setItem('barcodes', JSON.stringify(barcodes));
                updateUI();
            };
            li.appendChild(deleteBtn);
            barcodeListElement.appendChild(li);
            totalCount += barcodes[code];
            barcodeCount++;
        }

        totalCountElement.innerText = `总计扫描次数: ${totalCount}`;
        barcodeCountElement.innerText = `不同条形码个数: ${barcodeCount}`;
    }

    function addBarcode(code) {
        if (barcodes[code]) {
            barcodes[code]++;
        } else {
            barcodes[code] = 1;
        }
        localStorage.setItem('barcodes', JSON.stringify(barcodes));
        updateUI();
    }

    startScannerBtn.addEventListener("click", function() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("你的浏览器不支持相机访问。请使用现代浏览器如Chrome或Firefox。");
            return;
        }

        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: scannerContainer,
                constraints: {
                    width: 640,
                    height: 200, // 设置高度以适应条形码
                    facingMode: "environment"
                }
            },
            decoder: {
                readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
            }
        }, function(err) {
            if (err) {
                console.error(err);
                alert("初始化 Quagga 时出错：" + err);
                return;
            }
            console.log("Initialization finished. Ready to start");
            Quagga.start();
        });

        Quagga.onDetected(function(data) {
            let code = data.codeResult.code;
            addBarcode(code);
        });
    });

    addManualBarcodeBtn.addEventListener("click", function() {
        let code = manualBarcodeInput.value.trim();
        if (code) {
            addBarcode(code);
            manualBarcodeInput.value = '';
        }
    });

    copyBarcodesBtn.addEventListener("click", function() {
        let text = Object.keys(barcodes).map(code => `${code}: ${barcodes[code]}`).join('\n');
        navigator.clipboard.writeText(text).then(function() {
            alert('条形码已复制到剪贴板');
        }, function() {
            alert('复制失败');
        });
    });

    exportBarcodesBtn.addEventListener("click", function() {
        let text = Object.keys(barcodes).map(code => `${code}: ${barcodes[code]}`).join('\n');
        let blob = new Blob([text], {type: "text/plain;charset=utf-8"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'barcodes.txt';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    });

    clearBarcodesBtn.addEventListener("click", function() {
        if (confirm("确定要清空所有扫描记录吗？")) {
            barcodes = {};
            localStorage.removeItem('barcodes');
            updateUI();
        }
    });

    updateUI();
});
