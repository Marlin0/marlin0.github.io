
document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    let itemsPerPage = parseInt(document.getElementById('items-per-page').value);
    const addnumberinglabel = document.getElementById('addnumbering-label');
    const numbertotal = document.getElementById('number-total');
    const currentpagennumber = document.getElementById('currentpagennumber');
    const inputTracker = document.getElementById('tracking-number');
    const exportBtn = document.getElementById('export');
    const dateSelect = document.getElementById('date-select');
    const clearDateBtn = document.getElementById('clear-date');
    const tbody = document.querySelector('#tracking-list tbody');
    const searchInput = document.getElementById('search');
    const addnumber = document.getElementById('addnumber');
    const searchnumber = document.getElementById('searchnumber');
    const checkbox = document.getElementById("checkbox");
    //从缓存中提取trackingNumbers的数据
    let trackingNumbers = JSON.parse(localStorage.getItem('trackingNumbers')) || [];

    //全局按键事件
    document.addEventListener('keydown', function(event) {
        // 判断当前活动元素是否是需要忽略聚焦的输入类型元素
        const activeElementType = document.activeElement.tagName.toLowerCase();
        const isActiveElementInput = activeElementType === 'input' || activeElementType === 'textarea';
        const isTextInput = isActiveElementInput && ['text', 'search', 'email', 'number'].indexOf(document.activeElement.type) > -1;

        // 如果当前活动元素是文本输入框或文本区域，并且按键是字符键，但不包括组合键(ctrl、meta、alt)
        if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1 && !isTextInput) {
            inputTracker.focus();
        }
    });

    
    //快递单号输入框按键事件
    inputTracker.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTrackingNumber(this.value);
        }
    });
    addnumber.addEventListener('click', function(event) {
        addTrackingNumber(inputTracker.value);
    });

    function addTrackingNumber(number) {
        // 使用String.prototype.trim()方法去除输入两端的空格，然后检查处理后的字符串是否为空
        let trimmedNumber = number.trim();    // 去除输入两端的空格，然后检查处理后的字符串是否为空
        if (trimmedNumber === "") {
            //alert("快递单号不能为空！");
            showAlert("快递单号不能为空！","error")
            return; // 如果输入无效，直接返回并不执行后面的逻辑
        }
        trimmedNumber = trimmedNumber.toUpperCase();
        trimmedNumber = trimmedNumber.replace("-1-1-","");
    
        //获取当前日期
        const time = new Date().toLocaleDateString();
        addnumberinglabel.textContent = trimmedNumber;
        // 查找是否已有该快递单号
        const existingIndex = trackingNumbers.findIndex(item => item.number === trimmedNumber);
        if (existingIndex !== -1) {
            // 如果单号已存在，则增加计数
            const existingItem = trackingNumbers[existingIndex];
            existingItem.count++;
            showAlert(`快递单号已存在：${existingItem.number} 添加日期：${existingItem.time} 添加次数：${existingItem.count}次`,"success",4500)
            // 将已存在的单号移至数组首位
            trackingNumbers.splice(existingIndex, 1);
            trackingNumbers.unshift(existingItem);
        } else {
            // 如果单号不存在，添加为新项
            trackingNumbers.unshift({number: trimmedNumber, time: time, count: 1});
        }
    
        //将数据 存放到缓存中
        localStorage.setItem('trackingNumbers', JSON.stringify(trackingNumbers));

        //更新选择日期选项
        updateDateSelectOptions();
        dateSelect.value = time; // 设置为当前日期
        const selectedDate = dateSelect.value;
        const filteredNumbers = trackingNumbers.filter(item => item.time === selectedDate || selectedDate === 'all');

        renderList(filteredNumbers);
        // 清空输入字段以便下一次输入
        inputTracker.value = '';

    }

    //更新选择日期选项
    function updateDateSelectOptions() {
        const dates = new Set(trackingNumbers.map(item => item.time));
        dateSelect.innerHTML = '<option value="all">所有日期</option>';
        dates.forEach(date => {
            dateSelect.options.add(new Option(date, date));
        });
        dateSelect.dispatchEvent(new Event('change'));
    }

    //将数据添加到下面的列表中
    // function renderList(items) {
    //     tbody.innerHTML = '';
    //     items.forEach((item, index) => {
    //         let row = tbody.insertRow();
    //         row.insertCell(0).innerText = index + 1;
    //         row.insertCell(1).innerText = item.number;
    //         row.insertCell(2).innerText = item.time;
    //         row.insertCell(3).innerText = item.count; // 显示添加次数
    //         row.insertCell(4).innerText = getCourierName(item.number);
    //         let deleteCell = row.insertCell(5); // 更新列索引
    //         deleteCell.innerHTML = `<button onclick="deleteNumber('${item.number}')">删除</button>`;
    //     });
    // }
    function renderList(items) {
        
        numbertotal.textContent = `${items.length}`
        tbody.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = items.slice(startIndex, endIndex);
        currentpagennumber.textContent = `${paginatedItems.length}`
        paginatedItems.forEach((item, index) => {
            let row = tbody.insertRow();
            row.insertCell(0).innerText = startIndex + index + 1;
            row.insertCell(1).innerText = item.number;
            row.insertCell(2).innerText = item.time;
            row.insertCell(3).innerText = item.count; 
            row.insertCell(4).innerText = getCourierName(item.number);
            let deleteCell = row.insertCell(5);
            deleteCell.innerHTML = `<button onclick="deleteNumber('${item.number}')">删除</button>`;
        });

        // 更新分页导航
        renderPagination(items.length);
    }

    //通过单号来获取快递公司名称
    function getCourierName(number){
        //判断快递名称并返回
        return "未知"
    }

    //删除
    window.deleteNumber = function(number) {
        //console.log(`删除的快递单号: ${number}`);
        
        // 显示确认对话框
        const isConfirmed = confirm(`确定要删除 快递单号："${number}" 吗？`);
        
        if (isConfirmed) {
            // 查找与给定快递单号相匹配项的索引
            const index = trackingNumbers.findIndex(item => item.number === number);
            if (index !== -1) {
                // 如果找到匹配项，删除其元素
                trackingNumbers.splice(index, 1);
                localStorage.setItem('trackingNumbers', JSON.stringify(trackingNumbers));
                const selectedDate = dateSelect.value;
                const filteredNumbers = trackingNumbers.filter(item => item.time === selectedDate || selectedDate === 'all');
                renderList(filteredNumbers);
                showAlert(`快递单号: ${number} 已删除`);
            } else {
                //console.error(`未找到快递单号: ${number}`);
                showAlert(`未找到快递单号: ${number}`, 'error', 5000);
            }
        }
    };


    // 清除当前日期所有快递单号
    clearDateBtn.addEventListener('click', function() {
        const selectedDate = dateSelect.value;
        if (selectedDate !== 'all') {
            // 显示确认对话框
            const isConfirmed = confirm(`确定要清除日期为 ${selectedDate} 的所有快递单号吗？`);
            
            if (isConfirmed) {
                // 过滤出非所选日期的所有条目
                trackingNumbers = trackingNumbers.filter(item => item.time !== selectedDate);
                localStorage.setItem('trackingNumbers', JSON.stringify(trackingNumbers));
                showAlert(`已清除日期为 ${selectedDate} 的所有单号`, 'success');

                // 更新日期选择和列表显示
                updateDateSelectOptions();
                dateSelect.value = selectedDate;
                const filteredNumbers = trackingNumbers.filter(item => item.time === selectedDate);
                renderList(filteredNumbers);
            }
        } else {
            showAlert("请先选择一个特定的日期！", 'warning', 4000);
        }
    });


    //搜索快递单号
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            search_number();
        }
    });
    searchnumber.addEventListener('click', function(event) {
        search_number();
    });
    function search_number(){
        const snumber = searchInput.value.trim();    // 去除输入两端的空格，然后检查处理后的字符串是否为空
        if (snumber === "") {
            showAlert("快递单号不能为空！","error")
            return; // 如果输入无效，直接返回并不执行后面的逻辑
        }
        const filteredNumbers = trackingNumbers.filter(item => item.number === searchInput.value);
        if (filteredNumbers.length > 0){
            renderList(filteredNumbers);
        }else{
            showAlert(`没有搜索到单号 ${searchInput.value}`, 'error', 5000);
        }
        searchInput.value = ""
    }


    //选择日期有变化时的事件
    dateSelect.addEventListener('change', function(){
        renderList(getNowList()); // 重新渲染列表
    });

    //-----------------------------页码开始-----------------------------------
    // 获取当前需要显示的快递单列表
    function getNowList(){
        const selectedDate = dateSelect.value;
        const filteredNumbers = trackingNumbers.filter(item => item.time === selectedDate || selectedDate === 'all');
        return filteredNumbers
    }

    // 每页显示条数选择事件
    const itemsPerPageSelect = document.getElementById('items-per-page');
    itemsPerPageSelect.addEventListener('change', function() {
        itemsPerPage = parseInt(this.value);
        currentPage = 1; // 改变每页显示条数时，重置到第一页
        renderList(getNowList()); // 重新渲染列表
        
        // 将用户选择的值保存到localStorage中
        localStorage.setItem('itemsPerPage', itemsPerPage);

    });
    // 从localStorage中读取保存的每页显示项数
    const savedItemsPerPage = localStorage.getItem('itemsPerPage');
    // 如果有保存的值，则将其设置为下拉菜单的当前选项
    if (savedItemsPerPage) {
        itemsPerPageSelect.value = savedItemsPerPage;
        
        // 创建并触发一个change事件
        const event = new Event('change');
        itemsPerPageSelect.dispatchEvent(event);
    }

    // 渲染分页导航函数
    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        if (totalPages > 1) {
            // 添加首页按钮
            const firstPage = document.createElement('li');
            firstPage.innerHTML = '<button onclick="navigateToPage(1)">首页</button>';
            pagination.appendChild(firstPage);

            // 添加上一页按钮
            const prevPage = document.createElement('li');
            if (currentPage > 1) {
                prevPage.innerHTML = `<button onclick="navigateToPage(${currentPage - 1})">上一页</button>`;
            } else {
                prevPage.innerHTML = '<button disabled>上一页</button>';
            }
            pagination.appendChild(prevPage);

            // 添加页码
            for (let i = 1; i <= totalPages; i++) {
                const page = document.createElement('li');
                if (i === currentPage) {
                    //page.innerHTML = `<button class="active">${i}</button>`;
                    page.innerHTML = `<button class="active" disabled>${i}</button>`;
                } else {
                    page.innerHTML = `<button onclick="navigateToPage(${i})">${i}</button>`;
                }
                pagination.appendChild(page);
            }

            // 添加下一页按钮
            const nextPage = document.createElement('li');
            if (currentPage < totalPages) {
                nextPage.innerHTML = `<button onclick="navigateToPage(${currentPage + 1})">下一页</button>`;
            } else {
                nextPage.innerHTML = '<button disabled>下一页</button>';
            }
            pagination.appendChild(nextPage);

            // 添加尾页按钮
            const lastPage = document.createElement('li');
            lastPage.innerHTML = `<button onclick="navigateToPage(${totalPages})">尾页</button>`;
            pagination.appendChild(lastPage);
        }
    }

    // 定义分页导航的函数
    window.navigateToPage = function(page) {
        currentPage = page;
        renderList(getNowList()); // 重新渲染列表
    }

    //-----------------------------页码结束-----------------------------------
    

    
    //-----------------------------导出当前列表中的数据-----------------------------------
    
    exportBtn.addEventListener('click', function() {
        const txtData = arrayToTXT(getNowList()); // 假设这是要导出的数据
        downloadTXT(txtData);
        
    });
    function downloadTXT(data) {
        const blob = new Blob([data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', dateSelect.value);
        document.body.appendChild(a);
        a.click();
        showAlert(`已下载 日期：${dateSelect.value}的所有单号 \n 共计：${getNowList().length}个`)
        document.body.removeChild(a);
    }
    function arrayToTXT(data) {
        const txtRows = [];
        // 遍历每一项数据
        data.forEach(row => {
            //const rowText = Object.values(row).join('\t'); // 使用制表符或其他分隔符来分隔各个字段
            let rowText = row.number
            if(checkbox.checked){
                rowText = row.number + ","
            }
            txtRows.push(rowText);
        });

        return txtRows.join('\n');
    }


    //-----------------------------导出当前日期的所有数据-----------------------------------
    

    //-----------------------------复制当前列表中的数据-----------------------------------
    // 定位到复制按钮并设置点击事件监听器
    const copyDataBtn = document.getElementById('copydata');
    copyDataBtn.addEventListener('click', function() {
        // 获取表格的<tbody>元素，假设表格的id是'tracking-list'
            const tbody = document.querySelector('#tracking-list tbody');
        // 获取<tbody>中所有的<tr>元素（即所有行）
        const rows = tbody.querySelectorAll('tr');

        // 初始化一个数组来存储每行的“快递单号”数据
        const trackingNumbers = [];

        // 遍历每一行
        rows.forEach(row => {
            // 假设快递单号在第一列，索引为0
            let trackingNumber = row.querySelector('td:nth-child(2)').innerText
            if (checkbox.checked){
                trackingNumber = row.querySelector('td:nth-child(2)').innerText + ","; // 使用:nth-child选择器定位到特定列
            }
            // 将当前行的“快递单号”添加到数组中
            trackingNumbers.push(trackingNumber);
        });

        // 将数组中的所有“快递单号”连接成一个字符串，每个单号用换行符分隔
        const dataText = trackingNumbers.join('\n');

        // 使用navigator.clipboard.writeText将字符串复制到剪贴板
        navigator.clipboard.writeText(dataText).then(() => {
            showAlert('已复制当前页面的快递单号到剪贴板！\n 共计：' + trackingNumbers.length + '个');
        }).catch(err => {
            showAlert('复制到剪贴板失败：', "error");
        });
    });

    checkbox.addEventListener("change", function() {
        // 保存勾选框状态到缓存
        localStorage.setItem('checkboxStatus', checkbox.checked);

        // if (this.checked) {
        //     // 勾选框被选中时执行的操作
        //     console.log("勾选框被选中");
        // } else {
        //     // 勾选框未被选中时执行的操作
        //     console.log("勾选框未被选中");
        // }
    });
    // checkbox.addEventListener("click",function(){
    //     localStorage.setItem('checkboxStatus', checkbox.checked);
    // })
    function innt_checkbox(){
        // 从缓存中读取勾选框状态
        var checkboxStatus = localStorage.getItem('checkboxStatus');
        if (checkboxStatus === 'true') {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    }
    //-----------------------------复制当前列表中的数据-----------------------------------

    //页面初始化
    function init_list(){
        //获取当前日期
        const time = new Date().toLocaleDateString();
        updateDateSelectOptions();
        dateSelect.value = time;
        const selectedDate = dateSelect.value;
        const filteredNumbers = trackingNumbers.filter(item => item.time === selectedDate || selectedDate === 'all');
        renderList(filteredNumbers);
        showAlert("\n\n 扫描快递单号前 ***注意*** 切换至 《英文输入法》 \n\n","warning",5000)
    }
    init_list()
    innt_checkbox()
});
