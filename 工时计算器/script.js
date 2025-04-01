// 将所有变量和函数定义移到全局作用域
let monthlySalaryInput, workDaysInput, workHoursInput, hourlyWageElement, minuteWageElement, secondWageElement;
let workStartInput, workEndInput, todayWorkStatusElement, currentTimeElement, workedTimeElement, todayEarnedElement, workdayProgressElement;
let lunchBreakToggle, lunchBreakInputs, lunchStartInput, lunchEndInput;
let autoWorkDaysCheckbox;
let addExpenseBtn, expensesContainer, totalExpensesElement, dailyExpensesElement;
let expenses = [];
let holidays2024, workWeekends2024;

document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有DOM元素
    monthlySalaryInput = document.getElementById('monthly-salary');
    workDaysInput = document.getElementById('work-days');
    workHoursInput = document.getElementById('work-hours');
    hourlyWageElement = document.getElementById('hourly-wage');
    minuteWageElement = document.getElementById('minute-wage');
    secondWageElement = document.getElementById('second-wage');
    
    // 移除计算按钮相关代码
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.parentNode.removeChild(calculateBtn);
    }
    
    // 新增倒计时和今日工资计算相关元素
    workStartInput = document.getElementById('work-start');
    workEndInput = document.getElementById('work-end');
    todayWorkStatusElement = document.getElementById('today-work-status');
    currentTimeElement = document.getElementById('current-time');
    workedTimeElement = document.getElementById('worked-time');
    todayEarnedElement = document.getElementById('today-earned');
    workdayProgressElement = document.getElementById('workday-progress');
    
    // 添加午休时间相关变量和功能
    lunchBreakToggle = document.getElementById('lunch-break-toggle');
    lunchBreakInputs = document.getElementById('lunch-break-inputs');
    lunchStartInput = document.getElementById('lunch-start');
    lunchEndInput = document.getElementById('lunch-end');
    
    // 中国法定节假日数据（2024年）
    holidays2024 = [
        '2024-01-01', // 元旦
        '2024-02-10', '2024-02-11', '2024-02-12', '2024-02-13', '2024-02-14', '2024-02-15', '2024-02-16', '2024-02-17', // 春节
        '2024-04-04', '2024-04-05', '2024-04-06', // 清明节
        '2024-05-01', '2024-05-02', '2024-05-03', // 劳动节
        '2024-06-08', '2024-06-09', '2024-06-10', // 端午节
        '2024-09-15', '2024-09-16', '2024-09-17', // 中秋节
        '2024-10-01', '2024-10-02', '2024-10-03', '2024-10-04', '2024-10-05', '2024-10-06', '2024-10-07', // 国庆节
    ];
    
    // 调休上班的周末
    workWeekends2024 = [
        '2024-02-04', '2024-02-18', // 春节调休
        '2024-04-07', // 清明调休
        '2024-04-28', '2024-05-11', // 劳动节调休
        '2024-06-02', // 端午调休
        '2024-09-14', '2024-09-29', // 中秋调休
        '2024-10-12', // 国庆调休
    ];
    
    // 添加自动计算工作天数相关元素
    autoWorkDaysCheckbox = document.getElementById('auto-work-days');
    
    // 添加固定开支相关变量
    addExpenseBtn = document.getElementById('add-expense-btn');
    expensesContainer = document.getElementById('expenses-container');
    totalExpensesElement = document.getElementById('total-expenses');
    dailyExpensesElement = document.getElementById('daily-expenses');
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 从本地存储加载数据
    loadFromLocalStorage();
    
    // 计算总开支
    calculateTotalExpenses();
    
    // 初始计算
    calculateWages();
    
    // 初始化时间计算和显示
    updateTodayStatus();
    
    // 设置定时器，每秒更新一次
    setInterval(updateTodayStatus, 1000);
});

// 绑定所有事件监听器
function bindEventListeners() {
    // 输入框变化时自动计算并保存
    monthlySalaryInput.addEventListener('input', function() {
        calculateWages();
        saveToLocalStorage();
    });
    
    workDaysInput.addEventListener('input', function() {
        calculateWages();
        saveToLocalStorage();
    });
    
    workHoursInput.addEventListener('input', function() {
        calculateWages();
        saveToLocalStorage();
    });
    
    // 工作时间输入框变化事件
    workStartInput.addEventListener('change', function() {
        updateTodayStatus();
        saveToLocalStorage();
    });
    
    workEndInput.addEventListener('change', function() {
        updateTodayStatus();
        saveToLocalStorage();
    });
    
    // 午休开关事件监听
    lunchBreakToggle.addEventListener('change', function() {
        lunchBreakInputs.style.display = this.checked ? 'flex' : 'none';
        updateTodayStatus();
        saveToLocalStorage();
    });
    
    // 午休时间输入框变化事件
    lunchStartInput.addEventListener('change', function() {
        updateTodayStatus();
        saveToLocalStorage();
    });
    
    lunchEndInput.addEventListener('change', function() {
        updateTodayStatus();
        saveToLocalStorage();
    });
    
    // 添加自动计算工作天数的事件监听
    autoWorkDaysCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // 启用自动计算
            const autoWorkDays = calculateMonthWorkDays();
            workDaysInput.value = autoWorkDays;
            workDaysInput.disabled = true;
        } else {
            // 禁用自动计算，允许手动输入
            workDaysInput.disabled = false;
        }
        
        calculateWages();
        saveToLocalStorage();
    });
    
    // 确保添加开支按钮元素存在并正确绑定事件
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', function() {
            addExpenseItem();
            calculateTotalExpenses();
            saveToLocalStorage();
        });
    } else {
        console.error('添加开支按钮未找到');
    }
    
    // 每月1日自动更新工作天数
    const checkNewMonth = function() {
        const now = new Date();
        if (now.getDate() === 1 && autoWorkDaysCheckbox.checked) {
            const autoWorkDays = calculateMonthWorkDays();
            workDaysInput.value = autoWorkDays;
            calculateWages();
            saveToLocalStorage();
        }
    };
    
    // 每天检查一次是否是新的月份
    setInterval(checkNewMonth, 86400000); // 24小时 = 86400000毫秒
    
    // 初始检查
    checkNewMonth();
}

function saveToLocalStorage() {
    const userData = {
        monthlySalary: monthlySalaryInput.value,
        workDays: workDaysInput.value,
        workHours: workHoursInput.value,
        workStart: workStartInput.value,
        workEnd: workEndInput.value,
        lunchBreakEnabled: lunchBreakToggle.checked,
        lunchStart: lunchStartInput.value,
        lunchEnd: lunchEndInput.value,
        autoCalculateWorkDays: autoWorkDaysCheckbox.checked,
        expenses: expenses
    };
    
    localStorage.setItem('salaryCalculatorData', JSON.stringify(userData));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('salaryCalculatorData');
    
    // 计算当月工作天数
    const autoWorkDays = calculateMonthWorkDays();
    
    if (savedData) {
        const userData = JSON.parse(savedData);
        
        // 设置基本工资数据
        if (userData.monthlySalary) monthlySalaryInput.value = userData.monthlySalary;
        
        // 如果用户选择了自动计算工作天数，则使用计算值
        if (userData.autoCalculateWorkDays) {
            workDaysInput.value = autoWorkDays;
            autoWorkDaysCheckbox.checked = true;
            workDaysInput.disabled = true;
        } else {
            // 用户选择手动输入
            autoWorkDaysCheckbox.checked = false;
            workDaysInput.disabled = false;
            if (userData.workDays) workDaysInput.value = userData.workDays;
        }
        
        // 设置工作时间
        if (userData.workHours) workHoursInput.value = userData.workHours;
        if (userData.workStart) workStartInput.value = userData.workStart;
        if (userData.workEnd) workEndInput.value = userData.workEnd;
        
        // 设置午休数据
        if (userData.lunchBreakEnabled !== undefined) {
            lunchBreakToggle.checked = userData.lunchBreakEnabled;
            lunchBreakInputs.style.display = userData.lunchBreakEnabled ? 'flex' : 'none';
        }
        
        if (userData.lunchStart) lunchStartInput.value = userData.lunchStart;
        if (userData.lunchEnd) lunchEndInput.value = userData.lunchEnd;
        
        // 加载开支数据前先清空容器
        expensesContainer.innerHTML = '';
        
        // 加载开支数据
        if (userData.expenses && userData.expenses.length > 0) {
            userData.expenses.forEach(expense => {
                addExpenseItem(expense.name, expense.amount);
            });
        } else {
            // 如果没有保存的开支数据，添加一个默认的开支项目
            addExpenseItem('房租', '2000');
        }
    } else {
        // 首次使用，默认不启用自动计算
        autoWorkDaysCheckbox.checked = false;
        workDaysInput.disabled = false;
        
        // 添加一个默认的开支项目
        expensesContainer.innerHTML = '';
        addExpenseItem('房租', '2000');
    }
    
    // 计算总开支
    calculateTotalExpenses();
}

function calculateWages() {
    // 获取输入值
    const monthlySalary = parseFloat(monthlySalaryInput.value) || 0;
    const workDays = parseFloat(workDaysInput.value) || 22; // 默认22天
    const workHours = parseFloat(workHoursInput.value) || 8; // 默认8小时
    
    // 计算总工作小时数
    const totalWorkHours = workDays * workHours;
    
    // 计算时薪
    const hourlyWage = monthlySalary / totalWorkHours;
    
    // 计算分钟薪资
    const minuteWage = hourlyWage / 60;
    
    // 计算秒薪资
    const secondWage = minuteWage / 60;
    
    // 更新显示结果
    hourlyWageElement.textContent = hourlyWage.toFixed(2);
    minuteWageElement.textContent = minuteWage.toFixed(4);
    secondWageElement.textContent = secondWage.toFixed(6);
    
    // 根据数值大小添加颜色变化
    updateColorBasedOnValue(hourlyWageElement, hourlyWage, 100);
    updateColorBasedOnValue(minuteWageElement, minuteWage, 2);
    updateColorBasedOnValue(secondWageElement, secondWage, 0.03);
}

function updateColorBasedOnValue(element, value, threshold) {
    if (value >= threshold * 2) {
        element.style.color = '#2ecc71'; // 绿色 - 高薪
    } else if (value >= threshold) {
        element.style.color = '#3498db'; // 蓝色 - 中等
    } else if (value > 0) {
        element.style.color = '#e74c3c'; // 红色 - 低薪
    } else {
        element.style.color = '#7f8c8d'; // 灰色 - 无效值
    }
}

// 更新今日状态和工资计算
function updateTodayStatus() {
    const now = new Date();
    const currentTimeString = now.toLocaleTimeString('zh-CN');
    currentTimeElement.textContent = currentTimeString;
    
    // 检查今天是否是工作日
    const isWorkDay = checkIfWorkDay(now);
    
    // 获取工作开始和结束时间
    const workStartTime = parseTimeInput(workStartInput.value);
    const workEndTime = parseTimeInput(workEndInput.value);
    
    // 获取月薪和工作天数
    const monthlySalary = parseFloat(monthlySalaryInput.value) || 0;
    const workDays = parseFloat(workDaysInput.value) || 22; // 默认22天
    
    // 获取日均开支
    const dailyExpenses = parseFloat(dailyExpensesElement.textContent) || 0;
    
    // 设置今日状态
    if (!isWorkDay) {
        todayWorkStatusElement.textContent = '今日休息';
        todayWorkStatusElement.className = 'holiday';
        workedTimeElement.textContent = '0小时0分钟';
        
        // 显示净收入（负数，因为只有开支没有收入）
        const netIncome = -dailyExpenses;
        todayEarnedElement.textContent = `0.00元 (净收入: ${netIncome.toFixed(2)}元)`;
        todayEarnedElement.className = 'negative-income';
        
        workdayProgressElement.style.width = '0%';
        return;
    }
    
    // 计算当前时间的小时和分钟
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    // 计算工作开始和结束的总分钟数
    const workStartTotalMinutes = workStartTime.hour * 60 + workStartTime.minute;
    const workEndTotalMinutes = workEndTime.hour * 60 + workEndTime.minute;
    
    // 获取午休时间
    let lunchBreakMinutes = 0;
    let lunchStartTotalMinutes = 0;
    let lunchEndTotalMinutes = 0;
    
    if (lunchBreakToggle.checked) {
        const lunchStartTime = parseTimeInput(lunchStartInput.value);
        const lunchEndTime = parseTimeInput(lunchEndInput.value);
        lunchStartTotalMinutes = lunchStartTime.hour * 60 + lunchStartTime.minute;
        lunchEndTotalMinutes = lunchEndTime.hour * 60 + lunchEndTime.minute;
        lunchBreakMinutes = lunchEndTotalMinutes - lunchStartTotalMinutes;
    }
    
    // 计算工作日总时长（分钟），扣除午休时间
    const workdayTotalMinutes = workEndTotalMinutes - workStartTotalMinutes - lunchBreakMinutes;
    
    // 计算日薪（基于月薪和工作天数）
    const dailySalary = monthlySalary / workDays;
    
    // 计算每分钟薪资
    const minuteSalary = dailySalary / workdayTotalMinutes;
    
    // 判断当前是否在工作时间内
    if (currentTotalMinutes < workStartTotalMinutes) {
        // 还未开始工作
        todayWorkStatusElement.textContent = '未开始工作';
        todayWorkStatusElement.className = 'not-working';
        workedTimeElement.textContent = '0小时0分钟';
        
        // 显示净收入（负数，因为只有开支没有收入）
        const netIncome = -dailyExpenses;
        todayEarnedElement.textContent = `0.00元 (净收入: ${netIncome.toFixed(2)}元)`;
        todayEarnedElement.className = 'negative-income';
        
        workdayProgressElement.style.width = '0%';
    } else if (currentTotalMinutes >= workEndTotalMinutes) {
        // 已经下班
        todayWorkStatusElement.textContent = '已下班';
        todayWorkStatusElement.className = 'not-working';
        
        // 已工作时间为整个工作日（扣除午休）
        const workedHours = Math.floor(workdayTotalMinutes / 60);
        const workedMinutes = workdayTotalMinutes % 60;
        workedTimeElement.textContent = `${workedHours}小时${workedMinutes}分钟`;
        
        // 计算今日净收入（日薪减去日均开支）
        const netIncome = dailySalary - dailyExpenses;
        todayEarnedElement.textContent = `${dailySalary.toFixed(2)}元 (净收入: ${netIncome.toFixed(2)}元)`;
        
        // 根据净收入是否为正添加不同的样式
        if (netIncome >= 0) {
            todayEarnedElement.className = 'net-income';
        } else {
            todayEarnedElement.className = 'negative-income';
        }
        
        // 进度条显示100%
        workdayProgressElement.style.width = '100%';
    } else {
        // 检查是否在午休时间
        let isLunchBreak = false;
        let workedMinutesTotal = 0;
        
        if (lunchBreakToggle.checked && currentTotalMinutes >= lunchStartTotalMinutes && currentTotalMinutes < lunchEndTotalMinutes) {
            // 正在午休
            isLunchBreak = true;
            todayWorkStatusElement.textContent = '午休中';
            todayWorkStatusElement.className = 'lunch-break';
            
            // 已工作时间为上午的工作时间
            workedMinutesTotal = lunchStartTotalMinutes - workStartTotalMinutes;
        } else if (currentTotalMinutes < lunchStartTotalMinutes || !lunchBreakToggle.checked) {
            // 上午工作时间或没有午休
            workedMinutesTotal = currentTotalMinutes - workStartTotalMinutes;
        } else {
            // 下午工作时间
            workedMinutesTotal = (currentTotalMinutes - lunchEndTotalMinutes) + (lunchStartTotalMinutes - workStartTotalMinutes);
        }
        
        if (!isLunchBreak) {
            // 正在工作中
            todayWorkStatusElement.textContent = '工作中';
            todayWorkStatusElement.className = 'working';
        }
        
        // 计算已工作时间
        const workedHours = Math.floor(workedMinutesTotal / 60);
        const workedMinutes = workedMinutesTotal % 60;
        workedTimeElement.textContent = `${workedHours}小时${workedMinutes}分钟`;
        
        // 计算今日已赚金额（基于实际工作分钟数和日薪）
        const todayEarned = minuteSalary * workedMinutesTotal;
        
        // 计算今日净收入（已赚金额减去日均开支）
        const netIncome = todayEarned - dailyExpenses;
        todayEarnedElement.textContent = `${todayEarned.toFixed(2)}元 (净收入: ${netIncome.toFixed(2)}元)`;
        
        // 根据净收入是否为正添加不同的样式
        if (netIncome >= 0) {
            todayEarnedElement.className = 'net-income';
        } else {
            todayEarnedElement.className = 'negative-income';
        }
        
        // 计算工作进度百分比
        const progressPercentage = (workedMinutesTotal / workdayTotalMinutes) * 100;
        workdayProgressElement.style.width = `${Math.min(progressPercentage, 100)}%`;
    }
}

// 检查日期是否是工作日
function checkIfWorkDay(date) {
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0]; // 格式：YYYY-MM-DD
    
    // 检查是否是法定节假日
    if (holidays2024.includes(dateString)) {
        return false;
    }
    
    // 检查是否是调休工作日
    if (workWeekends2024.includes(dateString)) {
        return true;
    }
    
    // 周一至周五是工作日，周六日是休息日
    return dayOfWeek >= 1 && dayOfWeek <= 5;
}

// 解析时间输入
function parseTimeInput(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return {
        hour: hours,
        minute: minutes
    };
}

// 在calculateWages函数前添加计算当月工作天数的函数
function calculateMonthWorkDays() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    
    // 获取当月的天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let workDays = 0;
    
    // 遍历当月的每一天
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (checkIfWorkDay(date)) {
            workDays++;
        }
    }
    
    return workDays;
}

// 添加开支项目
function addExpenseItem(name = '', amount = '') {
    const expenseItem = document.createElement('div');
    expenseItem.className = 'expense-item';
    
    // 创建名称输入框
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'expense-name';
    nameInput.placeholder = '开支名称';
    nameInput.value = name;
    nameInput.lang = 'zh-CN';
    nameInput.autocomplete = 'off';
    
    // 创建金额输入框
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.className = 'expense-amount';
    amountInput.placeholder = '金额';
    amountInput.value = amount;
    
    // 创建删除按钮
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-expense';
    removeBtn.textContent = '×';
    
    // 添加删除按钮事件
    removeBtn.addEventListener('click', function() {
        expensesContainer.removeChild(expenseItem);
        calculateTotalExpenses();
        saveToLocalStorage();
    });
    
    // 添加输入框变化事件
    nameInput.addEventListener('input', function() {
        calculateTotalExpenses();
        saveToLocalStorage();
    });
    
    amountInput.addEventListener('input', function() {
        calculateTotalExpenses();
        saveToLocalStorage();
    });
    
    // 将元素添加到开支项目容器中
    expenseItem.appendChild(nameInput);
    expenseItem.appendChild(amountInput);
    expenseItem.appendChild(removeBtn);
    
    expensesContainer.appendChild(expenseItem);
}

// 计算总开支和日均开支
function calculateTotalExpenses() {
    expenses = [];
    let totalExpenses = 0;
    
    // 获取所有开支项目
    const expenseItems = expensesContainer.querySelectorAll('.expense-item');
    
    expenseItems.forEach(item => {
        const nameInput = item.querySelector('.expense-name');
        const amountInput = item.querySelector('.expense-amount');
        
        if (!nameInput || !amountInput) return;
        
        const name = nameInput.value;
        const amount = parseFloat(amountInput.value) || 0;
        
        if (name || amount) {
            expenses.push({ name, amount });
            totalExpenses += amount;
        }
    });
    
    // 更新总开支显示
    totalExpensesElement.textContent = totalExpenses.toFixed(2);
    
    // 计算日均开支
    const dailyExpenses = totalExpenses / 30; // 使用固定30天计算日均开支
    
    dailyExpensesElement.textContent = dailyExpenses.toFixed(2);
    
    // 更新今日状态
    updateTodayStatus();
    
    // 保存到本地存储
    saveToLocalStorage();
} 