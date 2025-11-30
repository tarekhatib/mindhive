module.exports = function getRankBySessions(sessions) {
  if (sessions >= 100) return { title: "Mind Master", emoji: "🧠" };
  if (sessions >= 80) return { title: "Elite Scholar", emoji: "📜" };
  if (sessions >= 50) return { title: "Hive Guardian", emoji: "🛡️" };
  if (sessions >= 25) return { title: "Amateur", emoji: "👨‍💻" };
  if (sessions >= 10) return { title: "Focused Bee", emoji: "🐝" };
  return { title: "Newbie", emoji: "🐣" };
};