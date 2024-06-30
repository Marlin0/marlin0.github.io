// 显示提示框函数
function showAlert(message, type = 'info', duration = 3500) {
    // 创建提示框元素
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type}`;
    alertBox.innerText = message;

    // 将提示框添加到文档中
    document.body.appendChild(alertBox);

    // 在指定时间后，使提示框淡出并移除
    setTimeout(() => {
        alertBox.classList.add('fade-out');
        alertBox.addEventListener('animationend', () => {
            alertBox.remove();
        });
    }, duration);
}