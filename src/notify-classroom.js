const core = require("@actions/core");

exports.NotifyClassroom = async function NotifyClassroom(runnerResults) {
  // combine max score and total score from each {runner, results} pair
  // if max_score is greater than 0 run the rest of this code
  const { totalPoints, maxPoints } = runnerResults.reduce(
    (acc, { results }) => {
      if (!results.max_score) return acc;

      acc.maxPoints += results.max_score;
      results.tests.forEach(({ score }) => {
        acc.totalPoints += score;
      });

      return acc;
    },
    { totalPoints: 0, maxPoints: 0 }
  );
  if (!maxPoints) return;
  const allTotalPoints = runnerResults.map(({ results }, index) => {
    // 如果没有 max_score，返回 "000/000"
    if (!results.max_score) return "000000";
    
    // 计算当前 runner 的总分
    const totalPoints = results.tests.reduce((sum, { score }) => sum + score, 0);
    const maxPoints = results.max_score;
    
    // 每四个 runner 分数相加
    if (index % 4 === 0) {
        // 获取当前组的4个runner（或少于4个如果到达数组末尾）
        const group = runnerResults.slice(index, index + 4);
        const groupTotal = group.reduce((sum, { results }) => {
            return results.max_score ? 
                sum + results.tests.reduce((s, { score }) => s + score, 0) : 
                sum;
        }, 0);
        const groupMax = group.reduce((sum, { results }) => {
            return results.max_score ? sum + results.max_score : sum;
        }, 0);
        
        // 将分数格式化为三位数，不足三位前面补0
        const formattedTotal = String(groupTotal).padStart(3, '0');
        const formattedMax = String(groupMax).padStart(3, '0');
        // 返回当前组的格式化结果
        return `${formattedTotal}${formattedMax}`;
    }
    // 非每组第一个元素返回空字符串，避免重复
    return '';
  }).join('');

  
  const allMaxPoints = runnerResults.map(({ results }) => {
    if (!results.max_score) return "000";
    return String(results.max_score).padStart(3, '0');
  }).join('');
  
  const text = `Points ${allTotalPoints}/${allMaxPoints}`;
  const summary = JSON.stringify({ totalPoints, maxPoints })

  // create notice annotations with the final result and summary
  core.notice(text, {
    title: "Autograding complete",
  })

  core.notice(summary, {
    title: "Autograding report",
  })
};
