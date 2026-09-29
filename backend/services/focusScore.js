/**
 * Focus Score Engine
 * Calculated by the application (not by AI)
 * Max = 100 points
 */

async function calculateFocusScore(userId, cycleNumber, models) {
  const { Goal, Action, Task, FocusSession, Information, Progress } = models;

  // 1. Goal Alignment (20 points)
  const goals = await Goal.find({ user: userId, cycleNumber });
  const priorityGoals = goals.filter(g => g.isPriority);
  let goalScore = 0;
  if (goals.length >= 3) goalScore += 8;
  else if (goals.length >= 1) goalScore += 4;
  if (priorityGoals.length >= 1) goalScore += 6;
  if (goals.length > 0 && priorityGoals.length / goals.length >= 0.3) goalScore += 6;
  goalScore = Math.min(goalScore, 20);

  // 2. High-Impact Work (25 points)
  const tasks = await Task.find({ user: userId, cycleNumber });
  let highImpactScore = 0;
  if (tasks.length > 0) {
    const highTasks = tasks.filter(t => t.impact === 'High');
    const totalTime = tasks.reduce((s, t) => s + t.estimatedTime, 0);
    const highTime = highTasks.reduce((s, t) => s + t.estimatedTime, 0);
    const highRatio = totalTime > 0 ? highTime / totalTime : 0;

    highImpactScore += Math.min(highTasks.length * 3, 12); // up to 12
    highImpactScore += Math.round(highRatio * 13);        // up to 13
  }
  highImpactScore = Math.min(highImpactScore, 25);

  // 3. Focus Consistency (20 points)
  const sessions = await FocusSession.find({ user: userId, cycleNumber });
  let focusScore = 0;
  if (sessions.length >= 3) focusScore += 10;
  else if (sessions.length >= 1) focusScore += 5;

  const totalMinutes = sessions.reduce((s, x) => s + (x.actualDuration || 0), 0);
  if (totalMinutes >= 120) focusScore += 10;
  else if (totalMinutes >= 60) focusScore += 6;
  else if (totalMinutes >= 25) focusScore += 3;
  focusScore = Math.min(focusScore, 20);

  // 4. Distraction Management (20 points)
  let distractionScore = 20; // start full and subtract
  if (sessions.length > 0) {
    const totalInterruptions = sessions.reduce((s, x) => s + (x.interruptions || 0), 0);
    const avgInterruptions = totalInterruptions / sessions.length;

    if (avgInterruptions <= 1) distractionScore = 20;
    else if (avgInterruptions <= 2) distractionScore = 15;
    else if (avgInterruptions <= 4) distractionScore = 10;
    else distractionScore = 5;
  } else {
    distractionScore = 5; // no sessions = low score
  }

  // 5. Information Management (15 points)
  const infoRecords = await Information.find({ user: userId, cycleNumber });
  let infoScore = 0;
  if (infoRecords.length > 0) {
    const usefulMinutes = infoRecords.filter(r => r.isUseful).reduce((s, r) => s + r.duration, 0);
    const totalInfoMinutes = infoRecords.reduce((s, r) => s + r.duration, 0);
    const usefulRatio = totalInfoMinutes > 0 ? usefulMinutes / totalInfoMinutes : 0;

    infoScore = Math.round(usefulRatio * 15);
  }
  infoScore = Math.min(infoScore, 15);

  // Final Score
  const totalScore = goalScore + highImpactScore + focusScore + distractionScore + infoScore;

  return {
    totalScore: Math.min(Math.round(totalScore), 100),
    breakdown: {
      goalAlignment: goalScore,
      highImpactWork: highImpactScore,
      focusConsistency: focusScore,
      distractionManagement: distractionScore,
      informationManagement: infoScore,
    },
  };
}

module.exports = { calculateFocusScore };