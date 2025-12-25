// --- 全局配置 ---
const REPO = "shenxudong2019-collab/my-team-page"; 
let isAdmin = false;

// 确保 DOM 加载完成后再执行
// script.js 结构建议
document.addEventListener('DOMContentLoaded', () => {
    // 将所有获取 DOM 的代码放在这里
    const container = document.getElementById('github-comments');
    
    if (container) {
        fetchGitHubIssues(); // 只有找到容器才执行
    }
});
async function fetchGitHubIssues() {
    // 每次执行时重新获取 DOM 元素，防止变量丢失
    const container = document.getElementById('github-comments');
    const countBadge = document.getElementById('comment-count');
    
    if (!container) return; 

    try {
        const response = await fetch(`https://api.github.com/repos/${REPO}/issues?state=open&t=${Date.now()}`);
        
        if (response.status === 403) throw new Error("API 被限流，请稍后再试");
        if (!response.ok) throw new Error("同步失败");

        const issues = await response.json();
        
        // 更新计数器
        if (countBadge) countBadge.innerText = `${issues.length} 条留言`;

        // 页面适配逻辑
        const isHomePage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');
        const displayIssues = isHomePage ? issues.slice(0, 3) : issues;

        if (displayIssues.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:#999;'>目前还没有留言...</p>";
            return;
        }

        // 直接在函数内渲染，避免传参导致的变量未定义
        container.innerHTML = displayIssues.map(issue => {
            const isCaptain = (issue.user.login === "shenxicheng"); // 替换为你的ID
            return `
                <div class="message-item" style="border-bottom: 1px solid #eee; padding: 15px 0; position: relative; ${isCaptain ? 'background:#f0faff;' : ''}">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <img src="${issue.user.avatar_url}" style="width: 30px; height: 30px; border-radius: 50%;">
                        <strong style="color: #2c3e50;">${issue.user.login}</strong>
                        ${isCaptain ? '<span style="background:#3498db; color:white; font-size:10px; padding:1px 5px; border-radius:3px;">ADMIN</span>' : ''}
                        <span style="font-size: 12px; color: #999;">${new Date(issue.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style="margin-left: 40px; color: #444;">${issue.title}</div>
                    ${isAdmin ? `<button onclick="deleteIssue(${issue.number})" style="position:absolute; right:0; top:15px; background:#ff4d4f; color:white; border:none; border-radius:4px; cursor:pointer;">删除</button>` : ''}
                </div>
            `;
        }).join('');

        if (isHomePage && issues.length > 3) {
            container.innerHTML += `<p style="text-align:center;"><a href="comments.html" style="color:#3498db; font-size:14px; text-decoration:none;">查看全部留言 →</a></p>`;
        }

    } catch (error) {
        container.innerHTML = `<p style="color:orange;">⚠️ ${error.message}</p>`;
    }
}

window.deleteIssue = (number) => {
    if (confirm("确定要处理这条留言吗？")) {
        window.open(`https://github.com/${REPO}/issues/${number}`, '_blank');
    }
};